import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import {
    createBillingPortalSessionUrlAction,
    createBillingPortalSessionUrlSchema,
} from './create-billing-portal-session-url';
import { createCheckoutSessionAction, createCheckoutSessionSchema } from './create-checkout-session';
import { createWalletCheckoutAction, createWalletCheckoutSchema } from './create-wallet-checkout';
import {
    getBillingActiveSubscriptionAction,
    getBillingActiveSubscriptionSchema,
} from './get-billing-active-subscription';
import { getBillingCustomerAction, getBillingCustomerSchema } from './get-billing-customer';
import { getBillingDetailsAction, getBillingDetailsSchema } from './get-billing-details';
import { getBillingInvoicesAction, getBillingInvoicesSchema } from './get-billing-invoices';
import { getBillingProductsAction, getBillingProductsSchema } from './get-billing-products';
import { getBillingSubscriptionsAction, getBillingSubscriptionsSchema } from './get-billing-subscriptions';
import { getWalletBalanceAction } from './get-wallet-balance';
import { getWalletTransactionsAction, getWalletTransactionsSchema } from './get-wallet-transactions';
import { updateBillingCustomerAction, updateBillingCustomerSchema } from './update-billing-customer';

const ctx = new CtxRouter<{ db: AppClient }>();

export const billingRouter = ctx.router({
    // Existing
    getBillingDetails: ctx.endpoint.input(getBillingDetailsSchema).action(getBillingDetailsAction),

    // Billing Customer & Info
    getBillingCustomer: ctx.endpoint.input(getBillingCustomerSchema).action(getBillingCustomerAction),
    updateBillingCustomer: ctx.endpoint.input(updateBillingCustomerSchema).action(updateBillingCustomerAction),

    // Products & Subscriptions
    getBillingProducts: ctx.endpoint.input(getBillingProductsSchema).action(getBillingProductsAction),
    getBillingSubscriptions: ctx.endpoint.input(getBillingSubscriptionsSchema).action(getBillingSubscriptionsAction),
    getBillingActiveSubscription: ctx.endpoint
        .input(getBillingActiveSubscriptionSchema)
        .action(getBillingActiveSubscriptionAction),

    // Invoices
    getBillingInvoices: ctx.endpoint.input(getBillingInvoicesSchema).action(getBillingInvoicesAction),

    // Checkout & Portal
    createCheckoutSession: ctx.endpoint.input(createCheckoutSessionSchema).action(createCheckoutSessionAction),
    createBillingPortalSessionUrl: ctx.endpoint
        .input(createBillingPortalSessionUrlSchema)
        .action(createBillingPortalSessionUrlAction),

    // Wallet
    getWalletBalance: ctx.endpoint.action(getWalletBalanceAction),
    getWalletTransactions: ctx.endpoint.input(getWalletTransactionsSchema).action(getWalletTransactionsAction),
    createWalletCheckout: ctx.endpoint.input(createWalletCheckoutSchema).action(createWalletCheckoutAction),
});
