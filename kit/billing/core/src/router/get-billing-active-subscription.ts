import { type BillingSubscription, billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const getBillingActiveSubscriptionSchema = z.object({
    config: billingConfigSchema,
});

export async function getBillingActiveSubscriptionAction(
    { config }: z.infer<typeof getBillingActiveSubscriptionSchema>,
    { db }: { db: AppClient },
): Promise<BillingSubscription | null> {
    try{
        console.warn( 'getBillingActiveSubscriptionSchema CALLED' )
        const billing = new BillingHandler(config, db);
        const billingCustomer = await billing.getBillingCustomer();
        const subscriptions = await billingCustomer.fetchSubscriptions();
    
        if (!subscriptions.data) {
            console.warn( 'getBillingActiveSubscriptionSchema CALLED - NO SUBSCRIPTIONS' )
            throw new Error('Failed to fetch subscriptions');
        }
    
        const filteredSubscriptions = subscriptions.data.filter(
            (subscription) => subscription.status === 'active' || subscription.status === 'trialing',
        );
    
        if (filteredSubscriptions.length > 1) {
            console.warn( 'getBillingActiveSubscriptionSchema CALLED - MULTIPLE SUBSCRIPTIONS' )
            throw new Error('Multiple subscriptions found');
        }
    
        const res = filteredSubscriptions[0] ?? null;
        console.log( {res} )
        return res
    }catch(e){
        console.error(e)
        throw e
    }
}
