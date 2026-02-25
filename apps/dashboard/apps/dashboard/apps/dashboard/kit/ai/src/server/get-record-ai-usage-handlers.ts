import { getDBClient } from '@kit/supabase-server';
import { eq, sql } from 'drizzle-orm';
import { aiMessage, aiThread, aiUsage } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { AiConfig } from '../config';
import { StreamTextOnFinishCallback, ToolSet } from 'ai';
import type { AppClient } from '@kit/db';

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
    if (!threadId) throw new Error('Failed to create thread');
    return threadId;
};

const calculateAiUsageCost = (
    aiConfig: AiConfig,
    modelId: string,
    tokenUsage: { inputTokens?: number; outputTokens?: number; reasoningTokens?: number; cachedInputTokens?: number },
): number => {
    const modelPricing = aiConfig.pricing[modelId];
    if (!modelPricing) {
        logger.warn({ modelId }, '[AI Usage] No pricing found for model');
        return 0;
    }
    return (
        ((tokenUsage.inputTokens || 0) / 1_000_000) * modelPricing.inputTokens +
        ((tokenUsage.outputTokens || 0) / 1_000_000) * modelPricing.outputTokens +
        ((tokenUsage.reasoningTokens || 0) / 1_000_000) * modelPricing.reasoningTokens +
        ((tokenUsage.cachedInputTokens || 0) / 1_000_000) * modelPricing.cachedInputTokens
    );
};

export const getRecordAiUsageHandlers = async ({
    aiConfig,
    body,
}: {
    aiConfig: AiConfig;
    body: { threadId?: string; title?: string; metadata?: Record<string, unknown> };
}) => {
    const db = await getDBClient();
    const user = await db.user.require();

    const effectiveThreadId = body.threadId ?? (await createThread(db, user.id, body.title, body.metadata));

    const onStreamTextFinish: StreamTextOnFinishCallback<ToolSet> = async (result) => {
        try {
            const assistantText =
                typeof result.text === 'string' ? result.text : JSON.stringify(result.text ?? '');
            await db.rls.transaction(async (tx) => {
                await tx.insert(aiMessage).values({
                    threadId: effectiveThreadId!,
                    userId: user.id,
                    role: 'assistant',
                    content: assistantText,
                });
                await tx
                    .update(aiThread)
                    .set({ updatedAt: sql`now()` })
                    .where(eq(aiThread.id, effectiveThreadId!));
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
        } catch (persistErr) {
            logger.warn({ error: persistErr }, 'Failed to persist assistant message or AI usage');
        }
    };

    return { effectiveThreadId, onStreamTextFinish };
};
