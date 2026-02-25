import type { WalletTransaction } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { WalletBilling } from '../server/wallet/wallet-billing';

export const getWalletTransactionsSchema = z.object({
    limit: z.number().optional().default(50),
});

export async function getWalletTransactionsAction(
    { limit = 50 }: z.infer<typeof getWalletTransactionsSchema>,
    { db }: { db: AppClient },
): Promise<{ data: WalletTransaction[] | null; error?: string }> {
    try {
        const user = await db.user.require();

        const walletBilling = new WalletBilling(db);
        const transactions = await walletBilling.getTransactions(user.id, limit);

        return { data: transactions };
    } catch (error) {
        logger.error({ error }, 'Failed to get wallet transactions');
        return { data: null, error: 'Failed to get wallet transactions' };
    }
}
