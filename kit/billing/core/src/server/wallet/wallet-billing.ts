import type {
    WalletBalance,
    WalletDeductionParams,
    WalletTransaction,
    WalletTransactionType,
} from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { type AiWallet, aiWallet, aiWalletTransaction } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * WalletBilling handles all AI wallet database operations including balance management,
 * transactions, and ensuring atomic operations with row-level locking
 */
export class WalletBilling {
    constructor(private readonly db: AppClient) {}

    /**
     * Get or create wallet for a user
     * @param userId - The user ID
     * @returns The wallet record
     */
    async getOrCreateWallet(userId: string): Promise<AiWallet> {
        // Try to get existing wallet
        const existingWallet = await this.db.admin.transaction(async (tx) => {
            return await tx.select().from(aiWallet).where(eq(aiWallet.userId, userId)).limit(1);
        });

        if (existingWallet.length > 0) {
            return existingWallet[0]!;
        }

        // Create new wallet if doesn't exist
        const newWallet = await this.db.admin.transaction(async (tx) => {
            const inserted = await tx
                .insert(aiWallet)
                .values({
                    userId,
                    balance: '0',
                    currency: 'USD',
                })
                .returning();

            return inserted[0];
        });

        if (!newWallet) {
            throw new Error('Failed to create wallet');
        }

        logger.info({ userId, walletId: newWallet.id }, 'Created new AI wallet');
        return newWallet;
    }

    /**
     * Get wallet balance for a user
     * @param userId - The user ID
     * @returns The wallet balance
     */
    async getBalance(userId: string): Promise<WalletBalance> {
        const wallet = await this.getOrCreateWallet(userId);

        return {
            balance: parseFloat(wallet.balance),
            currency: wallet.currency,
        };
    }

    /**
     * Deposit funds into wallet (called after successful payment)
     * @param userId - The user ID
     * @param amount - Amount to deposit (must be positive)
     * @param metadata - Additional metadata (e.g., stripe_payment_id)
     * @returns The transaction record
     */
    async deposit(userId: string, amount: number, metadata?: Record<string, unknown>): Promise<WalletTransaction> {
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }

        const wallet = await this.getOrCreateWallet(userId);

        // Perform atomic deposit with transaction
        const transaction = await this.db.admin.transaction(async (tx) => {
            // Update wallet balance
            const updated = await tx
                .update(aiWallet)
                .set({
                    balance: sql`balance + ${amount}`,
                    updatedAt: sql`now()`,
                })
                .where(eq(aiWallet.id, wallet.id))
                .returning();

            if (!updated[0]) {
                throw new Error('Failed to update wallet balance');
            }

            const newBalance = parseFloat(updated[0].balance);

            // Record transaction
            const txRecord = await tx
                .insert(aiWalletTransaction)
                .values({
                    userId,
                    walletId: wallet.id,
                    amount: amount.toString(),
                    type: 'deposit',
                    description: `Wallet top-up: $${amount.toFixed(2)}`,
                    balanceAfter: newBalance.toString(),
                    metadata: metadata ? metadata : null,
                })
                .returning();

            if (!txRecord[0]) {
                throw new Error('Failed to record transaction');
            }

            return txRecord[0];
        });

        logger.info(
            {
                userId,
                walletId: wallet.id,
                amount,
                newBalance: transaction.balanceAfter,
            },
            'Wallet deposit completed',
        );

        return {
            id: transaction.id,
            userId: transaction.userId,
            walletId: transaction.walletId,
            amount: parseFloat(transaction.amount),
            type: transaction.type as WalletTransactionType,
            description: transaction.description,
            balanceAfter: parseFloat(transaction.balanceAfter),
            metadata: transaction.metadata as Record<string, unknown> | null,
            createdAt: transaction.createdAt,
        };
    }

    /**
     * Deduct funds from wallet (for AI usage)
     * Allows negative balances - logs warning but continues with transaction
     * @param params - Deduction parameters
     * @returns The transaction record
     */
    async deduct(params: WalletDeductionParams): Promise<WalletTransaction> {
        const { userId, amount, description, metadata } = params;

        if (amount <= 0) {
            throw new Error('Deduction amount must be positive');
        }

        const wallet = await this.getOrCreateWallet(userId);

        try {
            // Perform atomic deduction with row-level locking
            const transaction = await this.db.admin.transaction(async (tx) => {
                // Lock the wallet row for update
                const lockedWallet = await tx.select().from(aiWallet).where(eq(aiWallet.id, wallet.id)).for('update');

                if (lockedWallet.length === 0) {
                    throw new Error('Wallet not found');
                }

                const currentBalance = parseFloat(lockedWallet[0]!.balance);

                // Log warning if deduction will result in negative balance
                if (currentBalance < amount) {
                    logger.warn(
                        {
                            userId,
                            walletId: wallet.id,
                            currentBalance,
                            requestedAmount: amount,
                            resultingBalance: currentBalance - amount,
                        },
                        'Wallet deduction will result in negative balance',
                    );
                }

                // Update wallet balance (allow negative balance)
                const updated = await tx
                    .update(aiWallet)
                    .set({
                        balance: sql`balance - ${amount}`,
                        updatedAt: sql`now()`,
                    })
                    .where(eq(aiWallet.id, wallet.id))
                    .returning();

                if (!updated[0]) {
                    throw new Error('Failed to update wallet balance');
                }

                const newBalance = parseFloat(updated[0].balance);

                // Record transaction
                const txRecord = await tx
                    .insert(aiWalletTransaction)
                    .values({
                        userId,
                        walletId: wallet.id,
                        amount: (-amount).toString(), // Negative for deduction
                        type: 'usage',
                        description,
                        balanceAfter: newBalance.toString(),
                        metadata: metadata ? metadata : null,
                    })
                    .returning();

                if (!txRecord[0]) {
                    throw new Error('Failed to record transaction');
                }

                return txRecord[0];
            });

            logger.info(
                {
                    userId,
                    walletId: wallet.id,
                    amount,
                    newBalance: transaction.balanceAfter,
                },
                'Wallet deduction completed',
            );

            return {
                id: transaction.id,
                userId: transaction.userId,
                walletId: transaction.walletId,
                amount: parseFloat(transaction.amount),
                type: transaction.type as WalletTransactionType,
                description: transaction.description,
                balanceAfter: parseFloat(transaction.balanceAfter),
                metadata: transaction.metadata as Record<string, unknown> | null,
                createdAt: transaction.createdAt,
            };
        } catch (error) {
            logger.error({ error, userId, amount }, 'Failed to deduct from wallet');
            throw error;
        }
    }

    /**
     * Get transaction history for a user
     * @param userId - The user ID
     * @param limit - Maximum number of transactions to return
     * @returns Array of transactions
     */
    async getTransactions(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
        const wallet = await this.getOrCreateWallet(userId);

        const transactions = await this.db.admin.transaction(async (tx) => {
            return await tx
                .select()
                .from(aiWalletTransaction)
                .where(eq(aiWalletTransaction.walletId, wallet.id))
                .orderBy(desc(aiWalletTransaction.createdAt))
                .limit(limit);
        });

        return transactions.map((tx) => ({
            id: tx.id,
            userId: tx.userId,
            walletId: tx.walletId,
            amount: parseFloat(tx.amount),
            type: tx.type as WalletTransactionType,
            description: tx.description,
            balanceAfter: parseFloat(tx.balanceAfter),
            metadata: tx.metadata as Record<string, unknown> | null,
            createdAt: tx.createdAt,
        }));
    }

    /**
     * Refund a transaction (e.g., after payment refund)
     * @param userId - The user ID
     * @param amount - Amount to refund (must be positive)
     * @param metadata - Additional metadata (e.g., original_transaction_id)
     * @returns The transaction record
     */
    async refund(userId: string, amount: number, metadata?: Record<string, unknown>): Promise<WalletTransaction> {
        if (amount <= 0) {
            throw new Error('Refund amount must be positive');
        }

        const wallet = await this.getOrCreateWallet(userId);

        // Perform atomic refund with transaction
        const transaction = await this.db.admin.transaction(async (tx) => {
            // Update wallet balance
            const updated = await tx
                .update(aiWallet)
                .set({
                    balance: sql`balance + ${amount}`,
                    updatedAt: sql`now()`,
                })
                .where(eq(aiWallet.id, wallet.id))
                .returning();

            if (!updated[0]) {
                throw new Error('Failed to update wallet balance');
            }

            const newBalance = parseFloat(updated[0].balance);

            // Record transaction
            const txRecord = await tx
                .insert(aiWalletTransaction)
                .values({
                    userId,
                    walletId: wallet.id,
                    amount: amount.toString(),
                    type: 'refund',
                    description: `Refund: $${amount.toFixed(2)}`,
                    balanceAfter: newBalance.toString(),
                    metadata: metadata ? metadata : null,
                })
                .returning();

            if (!txRecord[0]) {
                throw new Error('Failed to record transaction');
            }

            return txRecord[0];
        });

        logger.info(
            {
                userId,
                walletId: wallet.id,
                amount,
                newBalance: transaction.balanceAfter,
            },
            'Wallet refund completed',
        );

        return {
            id: transaction.id,
            userId: transaction.userId,
            walletId: transaction.walletId,
            amount: parseFloat(transaction.amount),
            type: transaction.type as WalletTransactionType,
            description: transaction.description,
            balanceAfter: parseFloat(transaction.balanceAfter),
            metadata: transaction.metadata as Record<string, unknown> | null,
            createdAt: transaction.createdAt,
        };
    }
}
