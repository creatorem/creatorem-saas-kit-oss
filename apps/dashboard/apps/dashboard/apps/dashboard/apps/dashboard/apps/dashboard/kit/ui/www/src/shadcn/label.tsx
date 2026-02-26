'use client';

import { cn } from '@kit/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const labelVariants = cva('text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70');

const Label: React.FC<React.ComponentPropsWithRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>> = ({
    className,
    ...props
}) => <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />;
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
