'use client';

import { cn } from '@kit/utils';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Icon } from '../icon';
import { Portal } from './portal';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = React.forwardRef<
    React.ComponentRef<typeof SheetPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Close
        className={cn(
            'ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none',
            className,
        )}
        {...props}
        ref={ref}
    >
        <Icon name="X" className="h-4 w-4" />
        <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
));
SheetClose.displayName = 'SheetClose';

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay: React.FC<React.ComponentPropsWithRef<typeof SheetPrimitive.Overlay>> = ({
    className,
    ...props
}) => (
    <SheetPrimitive.Overlay
        className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
            className,
        )}
        {...props}
    />
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
    'bg-background focus-visible:outline-primary fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out',
    {
        variants: {
            side: {
                top: 'inset-x-0 top-0 border-b',
                bottom: 'inset-x-0 bottom-0 border-t',
                left: 'inset-y-0 left-0 h-full w-[400px] max-w-[75vw] border-r',
                right: 'inset-y-0 right-0 h-full w-[400px] max-w-[75vw] border-l',
                'floating-right': 'right-2 top-2 bottom-2 min-w-[600px] w-[80vw] rounded-2xl border',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    },
);

const sheetAnimateVariants = cva(
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
    {
        variants: {
            side: {
                top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
                bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
                'floating-right': 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    },
);

const SheetContent = React.forwardRef<
    React.ComponentRef<typeof SheetPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
        VariantProps<typeof sheetVariants> & { noAnimate?: boolean }
>(({ side = 'right', noAnimate = false, className, ...props }, ref) => (
    <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), noAnimate ? '' : sheetAnimateVariants({ side }), className)}
        {...props}
    />
));

SheetContent.displayName = 'SheetContent';

interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
        VariantProps<typeof sheetVariants> {}

interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
        VariantProps<typeof sheetVariants> {}

const SimpleSheetContent = React.forwardRef<
    React.ComponentRef<typeof SheetPrimitive.Content>,
    SheetContentProps & {
        closeClassName?: string;
        overlay?: boolean;
        onClose?: (e: React.MouseEvent) => void;
        containerID?: string;
    }
>(({ className, containerID, closeClassName, overlay = false, onClose, children, ...props }, ref) => {
    const content = (
        <SheetPrimitive.Content ref={ref} {...props} className={className}>
            <SheetClose className={closeClassName} onClick={onClose} />
            {children}
        </SheetPrimitive.Content>
    );

    return overlay ? (
        <Portal containerID={containerID}>
            <SheetOverlay />
            {content}
        </Portal>
    ) : (
        <Portal containerID={containerID} asChild={!overlay}>
            {content}
        </Portal>
    );
});
SimpleSheetContent.displayName = 'SimpleSheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col gap-y-3 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle: React.FC<React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>> = ({ className, ...props }) => (
    <SheetPrimitive.Title className={cn('text-foreground text-lg font-semibold', className)} {...props} />
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription: React.FC<React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>> = ({
    className,
    ...props
}) => <SheetPrimitive.Description className={cn('text-muted-foreground text-sm', className)} {...props} />;
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetOverlay,
    SheetPortal,
    SheetTitle,
    SheetTrigger,
    SimpleSheetContent,
};
