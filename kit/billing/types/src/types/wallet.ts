/**
 * Wallet-related types for AI credit management
 */

export type WalletTransactionType = 'deposit' | 'usage' | 'refund' | 'adjustment';

export interface WalletBalance {
    balance: number;
    currency: string;
}

export interface WalletTransaction {
    id: string;
    userId: string;
    walletId: string;
    amount: number;
    type: WalletTransactionType;
    description: string | null;
    balanceAfter: number;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface CreateWalletTransactionParams {
    userId: string;
    walletId: string;
    amount: number;
    type: WalletTransactionType;
    description?: string;
    metadata?: Record<string, unknown>;
}

export interface WalletTopUpParams {
    amount: number;
    successUrl?: string;
    cancelUrl?: string;
}

export interface WalletDeductionParams {
    userId: string;
    amount: number;
    description: string;
    metadata?: Record<string, unknown>;
}
