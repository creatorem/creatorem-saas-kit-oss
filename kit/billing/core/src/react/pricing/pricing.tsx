'use client';

import { BillingConfig, BillingList, BillingPrice, BillingProduct } from '@kit/billing-types';
import { buttonVariants } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import { Slot } from '@kit/ui/slot';
import { cn, formatCurrency } from '@kit/utils';
import Link from 'next/link';
import React, {
    Children,
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    ReactNode,
    useContext,
    useMemo,
} from 'react';
import { Paths } from 'type-fest';

interface PricingContextValue {
    products: BillingProduct[];
    config: BillingConfig;
}

export const PricingContext = createContext<PricingContextValue | null>(null);

interface ProductContextValue {
    product: BillingProduct;
    price: BillingPrice;
    hasFreeTrial: boolean;
}

export const ProductContext = createContext<ProductContextValue | null>(null);

export interface PricingRootProps {
    children: ReactNode;
    products: BillingList<BillingProduct>;
    config: BillingConfig;
}

export const PricingRoot: React.FC<PricingRootProps> = ({ children, products, config }) => {
    const productData = products.data;

    return (
        <PricingContext.Provider
            value={{
                products: productData,
                config,
            }}
        >
            {children}
        </PricingContext.Provider>
    );
};

export const usePricing = () => {
    const context = useContext(PricingContext);
    if (!context) {
        throw new Error('usePricing must be used within PricingRoot');
    }
    return context;
};

interface PricingPlansProps {
    children: ReactNode;
    priceFilter?: (product: BillingPrice) => boolean;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ children, priceFilter }) => {
    const { products } = usePricing();

    const validProductsWithIndex = useMemo(() => {
        return products
            .map((product: BillingProduct, index: number) => {
                const price = product.prices.find((p: BillingPrice) => (priceFilter ? priceFilter(p) : true));
                if (!price) return null;
                const hasFreeTrial = product.prices.some(
                    (p: BillingPrice) => (priceFilter ? priceFilter(p) : true) && p.recurring?.trialPeriodDays,
                );
                return { product, price, hasFreeTrial, popular: product.popular, index };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [products, priceFilter]);

    const childArray = Children.toArray(children);
    const firstChild = childArray.length > 0 ? childArray[0] : null;
    const isPlanItemTemplate = isValidElement(firstChild) && firstChild.type === PricingPlanItem;

    return (
        <div className="bg-striped container border-y px-8 lg:px-0">
            <div className="grid grid-cols-1 gap-0 divide-dashed border-x border-dashed max-lg:divide-y lg:mx-10 lg:grid-cols-3 lg:divide-x">
                {validProductsWithIndex.map(({ product, index }) => (
                    <React.Fragment key={product.id}>
                        {isPlanItemTemplate ? (
                            cloneElement(firstChild as React.ReactElement<PricingPlanItemProps>, {
                                index,
                                priceFilter,
                            })
                        ) : (
                            <PricingPlanItem index={index} priceFilter={priceFilter}>
                                {children}
                            </PricingPlanItem>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

interface PricingPlanItemProps {
    children: ReactNode;
    index?: number;
    asChild?: boolean;
    className?: string;
    priceFilter?: (product: BillingPrice) => boolean;
}

const PricingPlanItemImpl = (
    { children, index, asChild = false, className, priceFilter }: PricingPlanItemProps,
    ref: React.Ref<HTMLDivElement>,
) => {
    const { products } = usePricing();

    if (typeof index === 'undefined') {
        throw new Error('`index` is required if not child of PricingPlans');
    }

    const Comp = asChild ? Slot : 'div';

    const product: BillingProduct | undefined = products[index];
    if (!product) return null;

    const price = product.prices.find((p: BillingPrice) => (priceFilter ? priceFilter(p) : true));
    if (!price) return null;

    const hasFreeTrial = product.prices.some(
        (p: BillingPrice) => (priceFilter ? priceFilter(p) : true) && p.recurring?.trialPeriodDays,
    );

    return (
        <ProductContext.Provider value={{ product, price, hasFreeTrial }}>
            <Comp ref={ref} data-popular={product.popular} className={cn('group/plan-item', className)}>
                {children}
            </Comp>
        </ProductContext.Provider>
    );
};

export const PricingPlanItem = forwardRef(PricingPlanItemImpl);

interface PricingProductProps {
    attr: Paths<ProductContextValue>;
}

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct must be used within PricingPlans or PricingPlanItem');
    }
    return context;
};

export const PricingProduct: React.FC<PricingProductProps> = ({ attr }) => {
    const ctx = useProduct();

    const getNestedValue = (obj: ProductContextValue, path: string): any => {
        return path.split('.').reduce((current: any, key: string) => current?.[key], obj);
    };

    const value = getNestedValue(ctx, attr);

    return value ?? null;
};

interface PricingProductFormatCurrencyProps {
    /**
     * If true, the unit will not be displayed
     * @default false
     */
    hideUnit?: boolean;
    /**
     * The locale to use for the currency formatting
     * @default 'en-US'
     */
    locale?: string;
}

export const PricingProductFormatCurrency: React.FC<PricingProductFormatCurrencyProps> = ({
    hideUnit = false,
    locale = 'en-US',
}) => {
    const { config } = usePricing();
    const { price } = useProduct();

    if (hideUnit) {
        return (price.amount / 100).toFixed(config.numberAfterComma);
    }

    return (
        <>
            {formatCurrency({
                value: price.amount / 100,
                currencyCode: price.currency,
                locale: locale,
                numberAfterComma: config.numberAfterComma,
            })}
        </>
    );
};

interface PricingIfPopularProps {
    children: ReactNode;
    /**
     * If true, the component will render the fallback if the product is not popular
     * @default false
     */
    fallback?: boolean;
}

export const PricingIfPopular: React.FC<PricingIfPopularProps> = ({ children, fallback = false }) => {
    const { product } = useProduct();

    if (product.popular) {
        if (!fallback) {
            return <>{children}</>;
        }
    } else if (fallback) {
        return <>{children}</>;
    }

    return null;
};

interface PricingIfHasTrialProps {
    children: ReactNode;
    /**
     * If true, the component will render the fallback if the product does not have a free trial
     * @default false
     */
    fallback?: boolean;
}

export const PricingIfHasTrial: React.FC<PricingIfHasTrialProps> = ({ children, fallback = false }) => {
    const { hasFreeTrial } = useProduct();

    if (hasFreeTrial) {
        if (!fallback) {
            return <>{children}</>;
        }
    } else if (fallback) {
        return <>{children}</>;
    }

    return null;
};

export const PricingFeatures: React.FC = () => {
    const { product } = useProduct();
    const features = product.features || [];

    return (
        <ul className="mt-3 space-y-3">
            {features.map((feature: string, i: number) => (
                <li key={i} className="text-muted-foreground group flex items-start gap-4 text-sm/6">
                    <span className="inline-flex h-6 items-center">
                        <Icon name="Plus" aria-hidden="true" className="fill-muted-foreground size-4" />
                    </span>
                    {feature}
                </li>
            ))}
        </ul>
    );
};

export const PricingProductLink: React.FC<React.ComponentProps<typeof Link>> = ({ children, className, ...props }) => {
    const { product, hasFreeTrial } = useProduct();

    return (
        <Link
            {...props}
            data-popular={Boolean(product.popular)}
            aria-label={
                hasFreeTrial
                    ? `Start a free trial on the ${product.name} plan`
                    : `Subscribe to the ${product.name} plan`
            }
            className={cn(buttonVariants({ variant: 'default' }), className)}
        >
            {children}
        </Link>
    );
};
