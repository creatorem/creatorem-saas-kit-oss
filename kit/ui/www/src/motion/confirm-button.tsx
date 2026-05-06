'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@kit/utils';
import { Icon } from '@kit/ui/icon';

type ConfirmButtonOrigin =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'right'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
    | 'left'
    | 'button'

interface ConfirmButtonProps extends HTMLMotionProps<'button'> {
    onConfirm?: () => void;
    onCancel?: () => void;
    origin?: ConfirmButtonOrigin;
    reverse?: boolean
}

const getContentPositionByOrigin = (reverse: boolean): Record<ConfirmButtonOrigin, string> => ({
    'top-left': 'left-0 top-0',
    top: 'left-1/2 top-0 -translate-x-1/2',
    'top-right': 'right-0 top-0',
    right: 'right-0 top-1/2 -translate-y-1/2',
    'bottom-right': 'right-0 bottom-0',
    bottom: 'left-1/2 bottom-0 -translate-x-1/2',
    'bottom-left': 'left-0 bottom-0',
    left: 'left-0 top-1/2 -translate-y-1/2',
    'button': reverse ? '-right-4 -top-4' : '-right-4 -bottom-4'
});

const TRANSITION = {};

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
    onConfirm,
    onCancel,
    children,
    onClick: defaultClick,
    className,
    origin = 'button',
    reverse = false,
    ...props
}) => {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        onCancel?.();
        handleClose();
    };

    const handleConfirm = () => {
        onConfirm?.();
        handleClose();
    };

    const Btn = ({ onClick }: { onClick?: () => void }) => {
        return (
            <motion.button
                layoutId="trigger"
                transition={TRANSITION}
                onClick={(e) => {
                    defaultClick?.(e);
                    onClick?.();
                }}
                {...props}
                className={cn('relative z-51 flex-1 cursor-pointer rounded-full bg-primary px-4 py-2 font-medium text-white', className)}
            >
                <motion.span
                    layoutId="trigger-shadow"
                    className="opacity-0!"
                    transition={TRANSITION}
                >
                    {children}
                </motion.span>
                <motion.span
                    layoutId="trigger-content"
                    layout="position"
                    className="absolute top-1/2 left-1/2 whitespace-nowrap -translate-1/2"
                    transition={TRANSITION}
                >
                    {children}
                </motion.span>
            </motion.button>
        );
    };

    return (
        <div className={cn('relative', className)}>
            <Btn
                onClick={() => {
                    setOpen(true);
                }}
            />

            <AnimatePresence>
                {open && (
                    <motion.div
                        className={cn(
                            'absolute z-50 w-100 flex rounded-4xl border bg-background p-4 gap-3',
                            reverse ? 'flex-col-reverse' : 'flex-col',
                            getContentPositionByOrigin(reverse)[origin],
                        )}
                        initial={{ opacity: 0 }}
                        transition={TRANSITION}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="flex flex-col gap-2"
                            initial={{
                                translateY: origin.includes('top') ? -10 : 10
                            }}
                            exit={{ translateY: origin.includes('top') ? -10 : 10 }}
                            animate={{
                                translateY: 0
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <Icon name="CircleQuestionMark" className="text-primary size-5" />
                                    <h3 className="text-xl font-medium">Confirm</h3>
                                </div>
                                <button
                                    // className="absolute top-3 right-3 rounded p-1"
                                    className="-mt-2"
                                    onClick={() => {
                                        handleClose();
                                    }}
                                >
                                    <Icon name="X" className="size-5 text-foreground" />
                                </button>
                            </div>
                            <p className="text-muted-foreground">Are you sure you want to do this ?</p>
                        </motion.div>
                        <div className="flex items-center gap-2">
                            <motion.button
                                initial={{
                                    translateY: origin.includes('top') ? -10 : 10
                                }}
                                exit={{ translateY: origin.includes('top') ? -10 : 10 }}
                                animate={{
                                    translateY: 0
                                }}
                                onClick={handleCancel}
                                className="cursor-pointer flex-1 rounded-full bg-muted px-4 py-2 font-medium text-foreground"
                            >
                                Cancel
                            </motion.button>

                            <Btn onClick={handleConfirm} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
