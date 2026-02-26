'use client';

import { MessagePartState } from '@assistant-ui/react';
import { useDelay } from '@kit/ui/hooks/use-delay';
import { Icon } from '@kit/ui/icon';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    itemMediaVariants,
    itemVariants,
} from '@kit/ui/item';
import { cn } from '@kit/utils';
import confetti from 'canvas-confetti';
import { capitalize } from 'lodash';
import { AnimatePresence, Easing, motion, Transition } from 'motion/react';
import React, { createContext, useContext, useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AiLoader } from './ai-loader';

const DEFAULT_DURATION = 0.5;
const DEFAULT_EASE = [0.7, 0, 0.6, 0.917] as Easing;

const DEFAULT_TRANSITION: Transition & { duration: number; layout: { duration: number } } = {
    ease: DEFAULT_EASE,
    duration: DEFAULT_DURATION,
    layout: {
        ease: DEFAULT_EASE,
        duration: DEFAULT_DURATION,
    },
};

const BG_CLASSNAME = 'bg-background';
const MB_CLASSNAME = 'mb-2';

interface AiToolContextType {
    /**
     * Must be a noun with a few adjectives or complements
     * Lowercase
     * @example 'product creation'
     */
    name: string;
    /**
     * Used for the loading text.
     *
     * Gerundive form of the name (verb + ing)
     * Lowercase
     * @example 'creating product'
     */
    whileName?: string;
    status: MessagePartState['status'];
    toolID: string;
}

const AiToolContext = createContext<AiToolContextType>({
    name: '',
    whileName: '',
    status: {} as MessagePartState['status'],
    toolID: '',
});

const useAiTool = () => {
    const ctx = useContext(AiToolContext);
    if (!ctx) {
        throw new Error('useAiTool must be used within a AiToolProvider');
    }
    return ctx;
};

interface AiToolProps extends Partial<Pick<AiToolContextType, 'name' | 'whileName'>> {
    coverAllStatuses?: boolean;
    status: MessagePartState['status'];
    children: React.ReactNode;
}

const statusHistory = new Map<
    string,
    { current: MessagePartState['status']['type']; previous: MessagePartState['status']['type'] | null }
>();

export const AiTool = ({ name, whileName, coverAllStatuses = false, status, children }: AiToolProps) => {
    const { t } = useTranslation('p_ai');
    const defaultName = name || t('toolOperation');
    const toolID = useId();
    if (statusHistory.get(toolID)?.current !== status.type) {
        statusHistory.set(toolID, {
            current: status.type,
            previous: statusHistory.get(toolID)?.current || null,
        });
    }

    return (
        <AiToolContext.Provider
            value={{
                name: defaultName.toLowerCase(),
                whileName: whileName?.toLowerCase(),
                status,
                toolID,
            }}
        >
            {children}
            {coverAllStatuses && <AiToolCoverAllStatuses>{children}</AiToolCoverAllStatuses>}
        </AiToolContext.Provider>
    );
};

const AiToolCoverAllStatuses: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { t } = useTranslation('p_ai');
    const { name, whileName } = useAiTool();

    const loaderElement = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.find((child) => React.isValidElement(child) && child.type === AiToolLoader);
    }, [children]);

    const incompleteElement = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.find((child) => React.isValidElement(child) && child.type === AiToolIncomplete);
    }, [children]);

    const completedElement = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.find((child) => React.isValidElement(child) && child.type === AiToolIfCompleted);
    }, [children]);

    const actionRequiredElement = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.find((child) => React.isValidElement(child) && child.type === AiToolIfActionRequired);
    }, [children]);

    const defaultLoader = <AiToolLoader>{whileName ? `${capitalize(whileName)}...` : t('loading')}</AiToolLoader>;
    const defaultIncomplete = <AiToolIncomplete />;
    const defaultCompleted = (
        <AiToolIfCompleted>
            <AiToolSuccessItem>
                <ItemMedia>
                    <Icon name="Check" className="size-4" />
                </ItemMedia>

                <ItemContent>
                    <ItemTitle>{t('completed', { name })}</ItemTitle>
                    <ItemDescription>{t('completedSuccessfully', { name })}</ItemDescription>
                </ItemContent>
            </AiToolSuccessItem>
        </AiToolIfCompleted>
    );
    const defaultActionRequired = (
        <AiToolIfActionRequired>
            <AiToolActionRequiredItem>
                <ItemMedia>
                    <Icon name="AlertCircle" className="size-4" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{t('actionRequired')}</ItemTitle>
                    <ItemDescription>{t('requiresYourAction', { name })}</ItemDescription>
                </ItemContent>
            </AiToolActionRequiredItem>
            <AiToolAbortedItem>
                <ItemMedia>
                    <Icon name="AlertCircle" className="size-4" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{t('aborted')}</ItemTitle>
                    <ItemDescription>{t('wasAborted', { name })}</ItemDescription>
                </ItemContent>
            </AiToolAbortedItem>
        </AiToolIfActionRequired>
    );

    return (
        <>
            {!loaderElement ? defaultLoader : null}
            {!incompleteElement ? defaultIncomplete : null}
            {!completedElement ? defaultCompleted : null}
            {!actionRequiredElement ? defaultActionRequired : null}
        </>
    );
};

/* -------------------------------- LOADING -------------------------------- */

interface AiToolLoaderProps {
    children: React.ReactNode;
    action?: React.ReactNode;
}

export const AiToolLoader = ({ children, action }: AiToolLoaderProps) => {
    const { status, toolID } = useAiTool();

    if (status.type !== 'running') return null;
    return (
        <motion.div
            data-type="ai-tool"
            layoutId={`ai-tool-item-${toolID}`}
            layout="size"
            transition={DEFAULT_TRANSITION}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                'animate-shimmer bg-border overflow-hidden rounded-[11px] p-px [--shimmer-color:var(--color-primary)]',
                MB_CLASSNAME,
            )}
        >
            <Item
                variant="outline"
                size="sm"
                className={cn(
                    'animate-shimmer rounded-lg border-none [--shimmer-color:color-mix(in_oklab,var(--primary)_10%,var(--background))]',
                    BG_CLASSNAME,
                )}
            >
                <motion.div
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={DEFAULT_TRANSITION}
                    className={itemMediaVariants()}
                >
                    <AiLoader className="size-4" />
                </motion.div>

                <ItemContent>
                    <motion.div
                        layout="position"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...DEFAULT_TRANSITION, delay: DEFAULT_DURATION * 0.2 }}
                        className="flex w-fit items-center gap-2 text-sm leading-snug font-medium"
                    >
                        {children}
                    </motion.div>
                </ItemContent>

                {action && (
                    <motion.div
                        className="flex items-center gap-2"
                        layout="position"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...DEFAULT_TRANSITION, delay: DEFAULT_DURATION * 0.5 }}
                    >
                        {action}
                    </motion.div>
                )}
            </Item>
        </motion.div>
    );
};

/* -------------------------------- utils -------------------------------- */

interface AnimatedOverlayItemProps extends Omit<React.ComponentProps<typeof Item>, 'asChild'> {
    wrapperClassName?: string;
    animationDuration?: number;
    children: React.ReactNode;
    overlay: React.ReactNode;
    classNameDuringAnimation?: string;
    /**
     * A function that will be called once the animation has ended and the status has changed.
     */
    onceAnimatedAfterStatusChanged?: () => Promise<void>;
}

const AnimatedOverlayItem: React.FC<AnimatedOverlayItemProps> = ({
    wrapperClassName,
    animationDuration = DEFAULT_DURATION * 2000,
    className,
    children,
    variant = 'outline',
    size = 'sm',
    overlay,
    classNameDuringAnimation,
    onceAnimatedAfterStatusChanged,
}) => {
    const { status, toolID } = useAiTool();
    const animationEndedDelay = useDelay(true, animationDuration);

    const prevStatus = statusHistory.get(toolID)?.previous;
    const hasPreviousStatus = prevStatus && prevStatus !== status.type;
    const animationEnded = animationEndedDelay === true || !hasPreviousStatus;

    useEffect(() => {
        if (!onceAnimatedAfterStatusChanged) return;
        if (!animationEnded || !hasPreviousStatus) {
            return;
        }

        let cancelled = false;

        const handleAnimatedAfterStatusChanged = async () => {
            try {
                if (cancelled) return;
                await onceAnimatedAfterStatusChanged?.();
            } catch (error) {
                console.error('Failed to launch confetti', error);
            }
        };

        handleAnimatedAfterStatusChanged();

        return () => {
            cancelled = true;
        };
    }, [animationEnded, hasPreviousStatus, onceAnimatedAfterStatusChanged]);

    return (
        <motion.div
            data-type="ai-tool"
            layoutId={`ai-tool-item-${toolID}`}
            layout="size"
            transition={DEFAULT_TRANSITION}
            initial={false}
            className={cn(
                itemVariants({ variant, size }),
                'relative overflow-hidden p-0 **:data-[slot=item-content]:gap-0.5 **:data-[slot=item-description]:text-xs',
                BG_CLASSNAME,
                MB_CLASSNAME,
                !animationEnded && classNameDuringAnimation,
                wrapperClassName,
            )}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ...DEFAULT_TRANSITION,
                    delay: hasPreviousStatus ? animationDuration / 1000 : 0,
                }}
                className={cn(itemVariants({ variant, size }), 'w-full border-none', className)}
            >
                {children}
            </motion.div>

            <AnimatePresence mode="wait">{!animationEnded && overlay}</AnimatePresence>
        </motion.div>
    );
};

/* -------------------------------- INCOMPLETED -------------------------------- */

const ErrorOverlay = () => {
    return (
        <motion.div
            className="bg-destructive pointer-events-auto absolute inset-0 z-20 flex items-center justify-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DEFAULT_DURATION * 0.5, ease: 'easeOut' }}
            role="status"
            aria-live="assertive"
        >
            <motion.div
                className="bg-destructive-foreground/15 flex size-9 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                layout="position"
                initial={false}
            >
                <motion.svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    initial={false}
                >
                    <motion.path
                        d="M7 7l10 10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.7,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                    />
                    <motion.path
                        d="M17 7L7 17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.7,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.3,
                        }}
                    />
                </motion.svg>
            </motion.div>
        </motion.div>
    );
};

interface IncompleteAlertProps {
    label?: {
        cancelTitle?: string;
        cancelDescription?: string;
        errorTitle?: string;
        errorDescription?: string;
    };
}

export function IncompleteAlert({ label }: IncompleteAlertProps) {
    const { t } = useTranslation('p_ai');
    const { name, status } = useAiTool();

    if (status.type !== 'incomplete') return null;

    if (status.reason === 'cancelled') {
        return (
            <>
                <ItemMedia>
                    <Icon name="Ban" className="size-4" />
                </ItemMedia>

                <ItemContent>
                    <ItemTitle>{label?.cancelTitle || t('cancelled', { name: capitalize(name) })}</ItemTitle>
                    <ItemDescription>{label?.cancelDescription || t('wasCancelled', { name })}</ItemDescription>
                </ItemContent>
            </>
        );
    }
    if (status.reason === 'error') {
        return (
            <>
                <ItemMedia>
                    <Icon name="AlertCircle" className="size-4" />
                </ItemMedia>

                <ItemContent>
                    <ItemTitle>{label?.errorTitle || t('anErrorOccurred')}</ItemTitle>
                    <ItemDescription>
                        {label?.errorDescription || t('errorMessage', { name })}
                        <br />
                        {JSON.stringify(status.error)}
                    </ItemDescription>
                </ItemContent>
            </>
        );
    }

    return (
        <>
            <ItemMedia>
                <Icon name="CircleSlash" className="size-4" />
            </ItemMedia>

            <ItemContent>
                <ItemTitle>{label?.errorTitle || t('anErrorOccurred')}</ItemTitle>
                <ItemDescription>
                    {label?.errorDescription || t('errorMessage', { name })}
                    <br />
                    {JSON.stringify(status.error)}
                </ItemDescription>
            </ItemContent>
        </>
    );
}

interface AiToolErrorItemProps
    extends Omit<AnimatedOverlayItemProps, 'overlay' | 'classNameDuringAnimation' | 'wrapperClassName'> { }

/**
 * Not filtered by status because this component may be used inside an AiToolIfCompleted component.
 */
export const AiToolErrorItem = (props: AiToolErrorItemProps) => {
    return (
        <AnimatedOverlayItem
            {...props}
            classNameDuringAnimation="border-destructive"
            className="text-destructive **:data-[slot=item-description]:text-destructive/90 after::content-[''] after:bg-destructive relative pl-5 after:absolute after:inset-y-1 after:left-1 after:w-1 after:rounded-full"
            overlay={<ErrorOverlay />}
        />
    );
};

interface AiToolIncompleteProps
    extends React.ComponentProps<typeof IncompleteAlert>,
    Omit<AnimatedOverlayItemProps, 'children' | 'overlay' | 'classNameDuringAnimation' | 'wrapperClassName'> { }

export const AiToolIncomplete = ({ label, ...props }: AiToolIncompleteProps) => {
    const { status } = useAiTool();

    if (status.type !== 'incomplete') return null;
    return (
        <AiToolErrorItem {...props}>
            <IncompleteAlert label={label} />
        </AiToolErrorItem>
    );
};

/* -------------------------------- COMPLETED -------------------------------- */

interface AiToolIfCompletedProps {
    children: React.ReactNode;
}

export const AiToolIfCompleted = ({ children }: AiToolIfCompletedProps) => {
    const { status } = useAiTool();
    return status.type === 'complete' ? children : null;
};

interface AiToolSuccessItemProps
    extends Omit<AnimatedOverlayItemProps, 'overlay' | 'classNameDuringAnimation' | 'onceAnimatedAfterStatusChanged' | 'wrapperClassName'> {
    /**
     * Display confetti when the tool is successfully completed.
     * @default false
     */
    confetti?: boolean;
}

export const AiToolSuccessItem: React.FC<AiToolSuccessItemProps> = ({ confetti: hasConfetti = false, ...props }) => {
    const { status } = useAiTool();
    return status.type === 'complete' ? (
        <AnimatedOverlayItem
            {...props}
            overlay={<SuccessOverlay />}
            classNameDuringAnimation="border-emerald-500"
            onceAnimatedAfterStatusChanged={
                hasConfetti
                    ? async () => {
                        const defaults = { scalar: 1.05, ticks: 200 } as const;

                        confetti({
                            ...defaults,
                            particleCount: 80,
                            spread: 70,
                            origin: { y: 0.7 },
                            startVelocity: 42,
                        });

                        confetti({
                            ...defaults,
                            particleCount: 50,
                            spread: 110,
                            origin: { y: 0.6 },
                            decay: 0.92,
                        });
                    }
                    : undefined
            }
        />
    ) : null;
};

const SuccessOverlay = () => {
    return (
        <motion.div
            className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-emerald-500 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DEFAULT_DURATION * 0.5, ease: 'easeOut' }}
            role="status"
            aria-live="assertive"
        >
            <motion.div
                className="bg-background/15 flex size-9 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                layout="position"
                initial={false}
            >
                <motion.svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    initial={false}
                >
                    <motion.path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                    />
                </motion.svg>
            </motion.div>
        </motion.div>
    );
};

/* -------------------------------- Action Required -------------------------------- */

interface AiToolIfActionRequiredProps {
    children: React.ReactNode;
}

export const AiToolIfActionRequired = ({ children }: AiToolIfActionRequiredProps) => {
    const { status } = useAiTool();
    return status.type === 'requires-action' ? children : null;
};

interface AiToolActionRequiredItemProps extends Omit<AnimatedOverlayItemProps, 'overlay' | 'classNameDuringAnimation' | 'wrapperClassName'> {
    className?: string;
}

export const AiToolActionRequiredItem = ({ className, ...props }: AiToolActionRequiredItemProps) => {
    const { status } = useAiTool();
    // const isNotInterrupted = status.type === 'requires-action' && status.reason !== 'interrupt';
    const isInterrupted = 'reason' in status && status.reason === 'interrupt';

    return !isInterrupted ? (
        <AnimatedOverlayItem
            {...props}
            overlay={<ActionRequiredOverlay />}
            classNameDuringAnimation="border-blue-500"
            // background color disabled
            // className="after::content-[''] relative bg-blue-500/5 pl-5 after:absolute after:inset-y-1 after:left-1  after:w-1 after:rounded-full after:bg-blue-500"
            className={cn(
                "after::content-[''] relative pl-5 after:absolute after:inset-y-1 after:left-1 after:w-1 after:rounded-full after:bg-blue-500",
                className,
            )}
            animationDuration={DEFAULT_DURATION * 2200}
        />
    ) : null;
};

const ActionRequiredOverlay = () => {
    return (
        <motion.div
            className={cn(
                'pointer-events-auto absolute inset-0 z-20 flex items-center justify-center text-white',
                'bg-blue-500',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DEFAULT_DURATION * 0.5, ease: 'easeOut' }}
            role="status"
            aria-live="assertive"
        >
            <motion.div
                className="bg-background/15 flex size-9 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                layout="position"
                initial={{ opacity: 0, rotate: -6 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: DEFAULT_DURATION * 0.8, ease: 'easeOut' }}
            >
                <motion.svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                        d="M11.5 15H7a4 4 0 0 0-4 4v2"
                    ></motion.path>
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                        d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"
                    ></motion.path>
                    <motion.circle
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                        cx="10"
                        cy="7"
                        r="4"
                    ></motion.circle>
                </motion.svg>
            </motion.div>
        </motion.div>
    );
};

interface AiToolAbortedItemProps extends Omit<AnimatedOverlayItemProps, 'overlay' | 'classNameDuringAnimation' | 'wrapperClassName'> { }

export const AiToolAbortedItem = (props: AiToolAbortedItemProps) => {
    const { status } = useAiTool();
    const isInterrupted = status.type === 'requires-action' && status.reason === 'interrupt';

    return status.type === 'requires-action' && isInterrupted ? (
        <AnimatedOverlayItem
            {...props}
            overlay={<AbortedOverlay />}
            classNameDuringAnimation="border-amber-500"
            // background color disabled
            // className="after::content-[''] relative bg-amber-500/5 pl-5 after:absolute after:inset-y-1 after:left-1  after:w-1 after:rounded-full after:bg-amber-500"
            className="after::content-[''] relative pl-5 after:absolute after:inset-y-1 after:left-1 after:w-1 after:rounded-full after:bg-amber-500"
            animationDuration={DEFAULT_DURATION * 2200}
        />
    ) : null;
};

const AbortedOverlay = () => {
    return (
        <motion.div
            className={cn(
                'pointer-events-auto absolute inset-0 z-20 flex items-center justify-center text-white',
                'bg-amber-500',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DEFAULT_DURATION * 0.5, ease: 'easeOut' }}
            role="status"
            aria-live="assertive"
        >
            <motion.div
                className="bg-background/15 flex size-9 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                layout="position"
                initial={false}
            >
                <motion.svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                >
                    <motion.rect
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.2,
                        }}
                        x="14"
                        y="3"
                        width="5"
                        height="18"
                        rx="1"
                    ></motion.rect>
                    <motion.rect
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: DEFAULT_DURATION * 0.8,
                            ease: 'easeInOut',
                            delay: DEFAULT_DURATION * 0.5,
                        }}
                        x="5"
                        y="3"
                        width="5"
                        height="18"
                        rx="1"
                    ></motion.rect>
                </motion.svg>
            </motion.div>
        </motion.div>
    );
};
