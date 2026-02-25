import { AiConfig, getIncludedAmountForInterval } from '@kit/ai/config';
import { WalletBilling } from '@kit/billing/server';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { calculateAiUsageCost } from './calculate-ai-usage';
import { BillingConfig } from '@kit/billing';
import { billingRouter } from '@kit/billing/router';

/**
 * Result of usage limit validation
 */
export interface UsageLimitValidationResult {
    allowed: boolean;
    reason?: string;
    errorMessage?: string;
    includedAmount?: string;
    source?: 'plan' | 'wallet' | 'no-limit';
}

/**
 * Context for wallet deduction calculation
 */
interface WalletDeductionContext {
    userId: string;
    totalUsage: {
        inputTokens?: number;
        outputTokens?: number;
        reasoningTokens?: number;
        cachedInputTokens?: number;
    };
    modelId: string;
    threadId: string;
    subscriptionCurrentPeriodStart: Date;
}

/**
 * Engine for managing AI usage limits and wallet deductions
 */
class AiUsageManager {
    constructor(private db: AppClient, private billingConfig: BillingConfig, private aiConfig: AiConfig) {}

    /**
     * Validates if the user can make an AI request based on their plan and wallet balance
     */
    async validateUsageLimit(
        userId: string,
        subscription: Awaited<ReturnType<typeof billingRouter.getBillingActiveSubscription.action>>,
    ): Promise<UsageLimitValidationResult> {
        const startTime = Date.now();
        logger.info({ userId }, '[AI Usage Manager] Starting usage limit validation');

        // Skip check if no limits configured
        if (!this.aiConfig.includedAmountPerSubscription) {
            const duration = Date.now() - startTime;
            logger.info({ userId, duration }, '[AI Usage Manager] No limits configured - allowing request');
            return { allowed: true, source: 'no-limit' };
        }

        try {
            // Get user's active subscription
            if (!subscription) {
                const duration = Date.now() - startTime;
                logger.info({ userId, duration }, '[AI Usage Manager] No subscription found - allowing request');
                return { allowed: true, source: 'no-limit' };
            }

            // Check subscription status
            if (subscription.status !== 'active' && subscription.status !== 'trialing') {
                const duration = Date.now() - startTime;
                logger.warn(
                    { userId, duration, status: subscription.status },
                    '[AI Usage Manager] Inactive subscription',
                );
                return {
                    allowed: false,
                    reason: 'inactive_subscription',
                    errorMessage:
                        'Your subscription is not active. Please update your subscription to continue using AI features.',
                    includedAmount: '0',
                };
            }

            // Get included amount for this product and interval
            const includedAmount = getIncludedAmountForInterval(
                this.aiConfig,
                subscription.productId,
                subscription.interval,
            );

            if (includedAmount === undefined) {
                const duration = Date.now() - startTime;
                logger.info(
                    { userId, duration, productId: subscription.productId, interval: subscription.interval },
                    '[AI Usage Manager] Product/interval not in config - allowing request',
                );
                return { allowed: true, source: 'no-limit' };
            }

            // Calculate current period usage
            const periodStartTimestamp = Math.floor(new Date(subscription.currentPeriodStart).getTime() / 1000);
            const currentUsage = await calculateAiUsageCost(this.db, userId, periodStartTimestamp, this.aiConfig);

            const duration = Date.now() - startTime;

            // Check if plan limit exceeded
            if (currentUsage >= includedAmount) {
                logger.warn(
                    {
                        userId,
                        duration,
                        currentUsage: currentUsage.toFixed(4),
                        includedAmount,
                        productId: subscription.productId,
                    },
                    '[AI Usage Manager] Plan limit exceeded - checking wallet',
                );

                // Check wallet balance
                const walletBalance = await this.getWalletBalance(userId);

                if (walletBalance > 0) {
                    logger.info(
                        { userId, duration, walletBalance },
                        '[AI Usage Manager] Plan limit exceeded but wallet has funds',
                    );
                    return { allowed: true, source: 'wallet' };
                }

                // Both plan and wallet exhausted
                logger.warn(
                    { userId, duration, walletBalance },
                    '[AI Usage Manager] Both plan and wallet limits exceeded',
                );

                return {
                    allowed: false,
                    reason: 'limits_exceeded',
                    errorMessage: `You have reached your AI usage limit of $${includedAmount.toFixed(2)} for this billing period and your wallet balance ($${walletBalance.toFixed(2)}) is insufficient. Please top up your wallet or upgrade your plan to continue using AI features.`,
                    includedAmount: includedAmount.toFixed(2),
                };
            }

            // Within plan limits
            logger.info(
                {
                    userId,
                    duration,
                    currentUsage: currentUsage.toFixed(4),
                    includedAmount,
                    remainingAmount: (includedAmount - currentUsage).toFixed(4),
                },
                '[AI Usage Manager] Within plan limits',
            );

            return { allowed: true, source: 'plan' };
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error({ error, userId, duration }, '[AI Usage Manager] Error during validation');
            // Don't block request on validation errors
            return { allowed: true, source: 'no-limit' };
        }
    }

    /**
     * Handles wallet deduction after AI request completion
     */
    async handleWalletDeduction(context: WalletDeductionContext): Promise<void> {
        // Skip if no usage limits configured
        if (!this.aiConfig.includedAmountPerSubscription) {
            return;
        }

        try {
            const subscription = await billingRouter.getBillingActiveSubscription.action(
                { config: this.billingConfig },
                { db: this.db, request: {} as any },
            );

            if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
                return;
            }

            // Get included amount for this product and interval
            const includedAmount = getIncludedAmountForInterval(
                this.aiConfig,
                subscription.productId,
                subscription.interval,
            );

            if (includedAmount === undefined) {
                return;
            }

            // Calculate request cost
            const requestCost = this.calculateRequestCost(context.totalUsage, context.modelId);

            if (!requestCost) {
                logger.warn(
                    { userId: context.userId, modelId: context.modelId },
                    '[AI Usage Manager] Could not calculate request cost',
                );
                return;
            }

            // Calculate usage before this request
            const periodStartTimestamp = Math.floor(context.subscriptionCurrentPeriodStart.getTime() / 1000);
            const totalUsageAfterRequest = await calculateAiUsageCost(
                this.db,
                context.userId,
                periodStartTimestamp,
                this.aiConfig,
            );
            const usageBeforeRequest = totalUsageAfterRequest - requestCost;

            // Determine deduction amount
            const deductionAmount = this.calculateDeductionAmount(
                usageBeforeRequest,
                totalUsageAfterRequest,
                includedAmount,
            );

            // Deduct from wallet if needed
            if (deductionAmount > 0) {
                await this.deductFromWallet({
                    userId: context.userId,
                    amount: deductionAmount,
                    modelId: context.modelId,
                    totalUsage: context.totalUsage,
                    cost: requestCost,
                    threadId: context.threadId,
                });
            }
        } catch (error) {
            logger.error({ error, userId: context.userId }, '[AI Usage Manager] Wallet deduction error');
            // Don't fail the request if wallet deduction fails
        }
    }

    /**
     * Gets the wallet balance for a user
     */
    private async getWalletBalance(userId: string): Promise<number> {
        const walletBilling = new WalletBilling(this.db);
        const wallet = await walletBilling.getBalance(userId);
        return wallet.balance;
    }

    /**
     * Calculates the cost of a single AI request
     */
    private calculateRequestCost(
        usage: {
            inputTokens?: number;
            outputTokens?: number;
            reasoningTokens?: number;
            cachedInputTokens?: number;
        },
        modelId: string,
    ): number | null {
        const modelPricing = this.aiConfig.pricing[modelId];

        if (!modelPricing) {
            return null;
        }

        return (
            ((usage.inputTokens || 0) / 1_000_000) * modelPricing.inputTokens +
            ((usage.outputTokens || 0) / 1_000_000) * modelPricing.outputTokens +
            ((usage.reasoningTokens || 0) / 1_000_000) * modelPricing.reasoningTokens +
            ((usage.cachedInputTokens || 0) / 1_000_000) * modelPricing.cachedInputTokens
        );
    }

    /**
     * Calculates how much should be deducted from wallet
     */
    private calculateDeductionAmount(
        usageBeforeRequest: number,
        totalUsageAfterRequest: number,
        includedAmount: number,
    ): number {
        if (usageBeforeRequest >= includedAmount) {
            // Already exceeded before this request - deduct full cost
            return totalUsageAfterRequest - usageBeforeRequest;
        } else if (totalUsageAfterRequest > includedAmount) {
            // This request pushed us over - deduct only overage
            return totalUsageAfterRequest - includedAmount;
        }

        // Still within plan limits - no deduction needed
        return 0;
    }

    /**
     * Deducts amount from user's wallet
     */
    private async deductFromWallet(params: {
        userId: string;
        amount: number;
        modelId: string;
        totalUsage: {
            inputTokens?: number;
            outputTokens?: number;
            reasoningTokens?: number;
            cachedInputTokens?: number;
        };
        cost: number;
        threadId: string;
    }): Promise<void> {
        const walletBilling = new WalletBilling(this.db);

        const deduction = await walletBilling.deduct({
            userId: params.userId,
            amount: params.amount,
            description: `AI usage: ${params.modelId}`,
            metadata: {
                modelId: params.modelId,
                inputTokens: params.totalUsage.inputTokens,
                outputTokens: params.totalUsage.outputTokens,
                reasoningTokens: params.totalUsage.reasoningTokens,
                cachedInputTokens: params.totalUsage.cachedInputTokens,
                cost: params.cost,
                threadId: params.threadId,
            },
        });

        logger.info(
            {
                userId: params.userId,
                amount: params.amount,
                remainingBalance: deduction.balanceAfter,
            },
            '[AI Usage Manager] Wallet deduction successful',
        );
    }
}

/**
 * Factory function to create an AI usage manager instance
 */
export function createAiUsageManager(db: AppClient, billingConfig: BillingConfig, aiConfig: AiConfig): AiUsageManager {
    return new AiUsageManager(db, billingConfig, aiConfig);
}
