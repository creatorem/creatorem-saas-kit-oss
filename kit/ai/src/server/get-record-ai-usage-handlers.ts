import { getDBClient } from '@kit/supabase-server';
import { eq, sql } from 'drizzle-orm';
import { aiMessage, aiThread, aiUsage } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { createAiUsageManager } from './ai-usage-manager';
import { AiConfig } from '../config';
import { BillingConfig } from '@kit/billing';
import { StreamTextOnFinishCallback, ToolSet } from 'ai';
import type { AppClient } from '@kit/db';
import type { TrpcClient } from '@creatorem/next-trpc/client';
import type { billingRouter } from '@kit/billing/router';

const createThread = async (
    db: AppClient,
    userId: string,
    title?: string,
    metadata?: Record<string, unknown>,
): Promise<string> => {
    const metadataJson = JSON.stringify(metadata ?? {});
    const result = await db.rls.transaction(async (tx) => {
        const inserted = await tx
            .insert(aiThread)
            .values({ userId, title: title ?? null, metadata: JSON.parse(metadataJson) })
            .returning({ id: aiThread.id });
        return inserted;
    });

    const threadId = result?.[0]?.id;
    if (!threadId) {
        throw new Error('Failed to create thread');
    }
    return threadId;
};

/**
 * Calculates the cost of AI usage based on token consumption and model pricing
 * @param modelId - The AI model identifier
 * @param tokenUsage - Token usage breakdown (input, output, reasoning, cached)
 * @returns The calculated cost in billing currency, or 0 if pricing not found
 */
const calculateAiUsageCost = (
    aiConfig: AiConfig,
    modelId: string,
    tokenUsage: {
        inputTokens?: number;
        outputTokens?: number;
        reasoningTokens?: number;
        cachedInputTokens?: number;
    },
): number => {
    const modelPricing = aiConfig.pricing[modelId];

    if (!modelPricing) {
        logger.warn({ modelId }, '[AI Usage] No pricing found for model');
        return 0;
    }

    const inputCost = ((tokenUsage.inputTokens || 0) / 1_000_000) * modelPricing.inputTokens;
    const outputCost = ((tokenUsage.outputTokens || 0) / 1_000_000) * modelPricing.outputTokens;
    const reasoningCost = ((tokenUsage.reasoningTokens || 0) / 1_000_000) * modelPricing.reasoningTokens;
    const cachedInputCost = ((tokenUsage.cachedInputTokens || 0) / 1_000_000) * modelPricing.cachedInputTokens;

    return inputCost + outputCost + reasoningCost + cachedInputCost;
};

export const getRecordAiUsageHandlers = async ({aiConfig, billingConfig, body, serverTrpc}: {aiConfig: AiConfig, billingConfig: BillingConfig, body: {threadId?: string, title?: string, metadata?: Record<string, unknown>}, serverTrpc: TrpcClient<typeof billingRouter>}) => {
        const db = await getDBClient();
        const user = await db.user.require();

        // subscription required for AI usage
        const subscriptionResult = await serverTrpc.getBillingActiveSubscription.fetch({
            config: billingConfig,
        });
        if (!subscriptionResult) {
            logger.warn({ userId: user.id }, 'No subscription found');
            return new Response(
                JSON.stringify({
                    error: '[AI usage limit exceeded]: No subscription found',
                    includedAmount: '0',
                }),
                {
                    status: 429, // Too Many Requests
                    headers: { 'content-type': 'application/json' },
                },
            );
        }

        // Validate AI usage limit before processing
        const usageManager = createAiUsageManager(db, billingConfig, aiConfig);
        const validationResult = await usageManager.validateUsageLimit(user.id, subscriptionResult);

        if (!validationResult.allowed) {
            logger.warn(
                { userId: user.id, reason: validationResult.reason },
                'AI usage limit exceeded',
            );
            return new Response(
                JSON.stringify({
                    error: `[AI usage limit exceeded]: ${validationResult.errorMessage}`,
                    includedAmount: validationResult.includedAmount,
                }),
                {
                    status: 429, // Too Many Requests
                    headers: { 'content-type': 'application/json' },
                },
            );
        }

        const effectiveThreadId = body.threadId ?? (await createThread(db, user.id, body.title, body.metadata));

        const onStreamTextFinish: StreamTextOnFinishCallback<ToolSet> = async (result) => {
                try {
                    const assistantText =
                        typeof result.text === 'string' ? result.text : JSON.stringify(result.text ?? '');
                    await db.rls.transaction(async (tx) => {
                        // Persist assistant message
                        await tx.insert(aiMessage).values({
                            threadId: effectiveThreadId!,
                            userId: user.id,
                            role: 'assistant',
                            content: assistantText,
                        });

                        // Update thread timestamp
                        await tx
                            .update(aiThread)
                            .set({ updatedAt: sql`now()` })
                            .where(eq(aiThread.id, effectiveThreadId!));

                        // Track AI usage
                        if (result.totalUsage) {
                            const modelId = result.response?.modelId || 'unknown';
                            const cost = calculateAiUsageCost(aiConfig, modelId, result.totalUsage);

                            await tx.insert(aiUsage).values({
                                userId: user.id,
                                inputTokens: result.totalUsage.inputTokens || 0,
                                outputTokens: result.totalUsage.outputTokens || 0,
                                reasoningTokens: result.totalUsage.reasoningTokens || 0,
                                cachedInputTokens: result.totalUsage.cachedInputTokens || 0,
                                modelId,
                                cost: cost.toString(),
                                aiTimestamp: result.response?.timestamp
                                    ? new Date(result.response.timestamp).toISOString()
                                    : new Date().toISOString(),
                            });
                        }
                    });

                    // Handle wallet deduction if usage limits configured
                    if (result.totalUsage) {
                        try {
                            const subscriptionResult = await serverTrpc.getBillingActiveSubscription.fetch({
                                config: billingConfig,
                            });

                            if (subscriptionResult) {
                                const currentPeriodStart = new Date(subscriptionResult.currentPeriodStart);
                                await usageManager.handleWalletDeduction({
                                    userId: user.id,
                                    totalUsage: result.totalUsage,
                                    modelId: result.response?.modelId || 'unknown',
                                    threadId: effectiveThreadId!,
                                    subscriptionCurrentPeriodStart: currentPeriodStart,
                                });
                            }
                        } catch (walletErr) {
                            logger.error({ error: walletErr, userId: user.id }, '[AI Usage] Wallet deduction error');
                            // Don't fail the entire request if wallet deduction fails
                        }
                    }
                } catch (persistErr) {
                    logger.warn({ error: persistErr }, 'Failed to persist assistant message or AI usage');
                }
        }

        return{effectiveThreadId, onStreamTextFinish}

}