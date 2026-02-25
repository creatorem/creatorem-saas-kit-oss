import { AbstractBillingEntity, BillingAttachedTable } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { UserBilling } from './user-billing';

export const billingEntityList: {
    [K in BillingAttachedTable]?: new (
        db: AppClient,
    ) => AbstractBillingEntity;
} = {
    user: UserBilling,
};
