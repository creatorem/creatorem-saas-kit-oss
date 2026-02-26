import { cva } from 'class-variance-authority';

export const quickFormFieldVariants = cva('', {
    variants: {
        variant: {
            default: 'max-w-lg',
            'full-width': 'w-full',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export const quickFormInputVariants = cva('', {
    variants: {
        variant: {
            default: 'max-w-md',
            'full-width': 'w-full',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
