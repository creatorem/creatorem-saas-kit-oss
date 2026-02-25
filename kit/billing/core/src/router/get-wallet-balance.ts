import type { WalletBalance } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { WalletBilling } from '../server/wallet/wallet-billing';

export async function getWalletBalanceAction({
    db,
}: {
    db: AppClient;
}): Promise<{ data: WalletBalance | null; error?: string }> {
    try {
        const user = await db.user.require();

        const walletBilling = new WalletBilling(db);
        const balance = await walletBilling.getBalance(user.id);

        return { data: balance };
    } catch (error) {
        logger.error({ error }, 'Failed to get wallet balance');
        return { data: null, error: 'Failed to get wallet balance' };
    }
}
