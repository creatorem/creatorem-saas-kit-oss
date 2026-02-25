import type { BillingPrice, BillingProduct } from '@kit/billing-types';

export const getProductAndPrice = (
    products: BillingProduct[],
    priceId: string,
): {
    price: BillingPrice | null;
    product: BillingProduct | null;
} => {
    try {
        const product = products.find((product) => product.prices.find((price) => price.id === priceId));
        if (!product) throw new Error('Product not found');

        const price = product.prices.find((price) => price.id === priceId);
        if (!price) throw new Error('Price not found');

        return { price, product };
    } catch {
        return {
            price: null,
            product: null,
        };
    }
};
