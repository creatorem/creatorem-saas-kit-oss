'use client';

import { useAssistantApi, useAssistantState } from '@assistant-ui/react';
import { Button } from '@kit/ui/button';
import { useDelay } from '@kit/ui/hooks/use-delay';
import { Icon } from '@kit/ui/icon';
import { Portal } from '@kit/ui/portal';
import { cn } from '@kit/utils';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Thread, type Suggestion } from './thread';

type FloatingAIChatContextType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expandPromptInput: boolean;
    setExpandPromptInput: React.Dispatch<React.SetStateAction<boolean>>;
    showAIConversation: boolean;
    setShowAIConversation: React.Dispatch<React.SetStateAction<boolean>>;
    /**
     * Used to show the essential elements of the conversation only floating above the prompt input.
     */
    showEssentialConversation: boolean;
    setShowEssentialConversation: React.Dispatch<React.SetStateAction<boolean>>;
    lastSetShowEssentialIsDueToRunning: boolean;
    setLastSetShowEssentialIsDueToRunning: React.Dispatch<React.SetStateAction<boolean>>;
    canShowAIConversation: boolean;
    setCanShowAIConversation: React.Dispatch<React.SetStateAction<boolean>>;
    /**
     * Set of tool names that are currently disabled (all tools are enabled by default)
     */
    disabledTools: Set<string>;
    setDisabledTools: React.Dispatch<React.SetStateAction<Set<string>>>;
    /**
     * Currently selected AI model ID
     */
    selectedModel: string | null;
    setSelectedModel: React.Dispatch<React.SetStateAction<string | null>>;
    /**
     * List of available AI models
     */
    availableModels: Array<{ id: string; name: string }>;
    suggestions: Suggestion[];
};

const FloatingAIChatContext = createContext<FloatingAIChatContextType>({
    open: false,
    setOpen: () => { },
    expandPromptInput: false,
    setExpandPromptInput: () => { },
    showAIConversation: false,
    setShowAIConversation: () => { },
    showEssentialConversation: false,
    setShowEssentialConversation: () => { },
    lastSetShowEssentialIsDueToRunning: false,
    setLastSetShowEssentialIsDueToRunning: () => { },
    canShowAIConversation: false,
    setCanShowAIConversation: () => { },
    disabledTools: new Set(),
    setDisabledTools: () => { },
    selectedModel: null,
    setSelectedModel: () => { },
    availableModels: [],
    suggestions: [],
});

export const useFloatingAIChat = () => {
    const context = useContext(FloatingAIChatContext);
    if (!context) {
        throw new Error('useFloatingAIChat must be used within a FloatingAIChatProvider');
    }
    return context;
};

const useDefaultSuggestions = (): Suggestion[] => {
    const { t } = useTranslation('p_ai');

    return [
        {
            icon: <Icon name="Navigation" className="size-4 min-w-4" />,
            title: t('suggestionCategoryNavigation'),
            prompts: [
                t('suggestionNavigationPrompt1'),
                t('suggestionNavigationPrompt2'),
                t('suggestionNavigationPrompt3'),
                t('suggestionNavigationPrompt4'),
            ],
        },
        {
            icon: <Icon name="ShoppingCart" className="size-4 min-w-4" />,
            title: t('suggestionCategoryProducts'),
            prompts: [
                t('suggestionProductsPrompt1'),
                t('suggestionProductsPrompt2'),
                t('suggestionProductsPrompt3'),
            ],
        },
        {
            icon: <Icon name="Search" className="size-4 min-w-4" />,
            title: t('suggestionCategorySearch'),
            prompts: [
                t('suggestionSearchPrompt1'),
                t('suggestionSearchPrompt2'),
                t('suggestionSearchPrompt3'),
                t('suggestionSearchPrompt4'),
            ],
        },
        {
            icon: <Icon name="Users" className="size-4 min-w-4" />,
            title: t('suggestionCategoryHelp'),
            prompts: [
                t('suggestionHelpPrompt1'),
                t('suggestionHelpPrompt2'),
                t('suggestionHelpPrompt3'),
            ],
        },
    ];
}

export const FloatingAIChatProvider = ({
    children,
    disabledTools,
    setDisabledTools,
    selectedModel: selectedModelProp,
    setSelectedModel: setSelectedModelProp,
    availableModels = [],
    defaultModel,
    suggestions,
}: {
    children: React.ReactNode;
    disabledTools: Set<string>;
    setDisabledTools: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedModel?: string | null;
    setSelectedModel?: React.Dispatch<React.SetStateAction<string | null>>;
    availableModels?: Array<{ id: string; name: string }>;
    defaultModel?: string;
    suggestions?: Suggestion[];
}) => {
    const [open, setOpen] = useState(false);
    const [expandPromptInput, setExpandPromptInput] = useState(false);
    const [showAIConversation, setShowAIConversation] = useState(false);
    const [showEssentialConversation, setShowEssentialConversation] = useState(false);
    const [canShowAIConversation, setCanShowAIConversation] = useState(true);
    const [lastSetShowEssentialIsDueToRunning, setLastSetShowEssentialIsDueToRunning] = useState(false);

    // Determine the initial model: use defaultModel if provided, otherwise use first available model
    const initialModel = defaultModel || (availableModels.length > 0 ? (availableModels[0]?.id ?? null) : null);

    // Use internal state if no external state is provided
    const [internalSelectedModel, setInternalSelectedModel] = useState<string | null>(initialModel);

    const selectedModel = selectedModelProp !== undefined ? selectedModelProp : internalSelectedModel;
    const setSelectedModel = setSelectedModelProp || setInternalSelectedModel;

    const handleSetShowAIConversation = useCallback(
        (value: React.SetStateAction<boolean>) => {
            if (canShowAIConversation) {
                setShowAIConversation(value);
            } else {
                setShowAIConversation(false);
                // we show the essential conversation instead
                setShowEssentialConversation(true);
            }
        },
        [canShowAIConversation],
    );

    useEffect(() => {
        if (!canShowAIConversation) {
            setShowAIConversation(false);
        }
    }, [canShowAIConversation]);

    // fade aniation when the essential messages are shown after running (when the ai is not in full display mode)
    const running = useAssistantState(({ thread }) => thread.isLoading || thread.isRunning);
    const essentialFadeEnded = useDelay(Boolean(!running && lastSetShowEssentialIsDueToRunning), 6000);
    useEffect(() => {
        if (essentialFadeEnded) {
            setShowEssentialConversation(false);
            setLastSetShowEssentialIsDueToRunning(false);
        }
    }, [essentialFadeEnded]);

    const defaultSuggestions = useDefaultSuggestions();

    return (
        <FloatingAIChatContext.Provider
            value={{
                open,
                setOpen,
                expandPromptInput,
                setExpandPromptInput,
                showAIConversation,
                setShowAIConversation: handleSetShowAIConversation,
                showEssentialConversation,
                setShowEssentialConversation,
                canShowAIConversation,
                setCanShowAIConversation,
                lastSetShowEssentialIsDueToRunning,
                setLastSetShowEssentialIsDueToRunning,
                disabledTools,
                setDisabledTools,
                selectedModel,
                setSelectedModel,
                availableModels,
                suggestions: suggestions ?? defaultSuggestions,
            }}
        >
            {children}
        </FloatingAIChatContext.Provider >
    );
};

const FloatingAIChatDebugButton = () => {
    // debug pruposes only
    const { t } = useTranslation('p_ai');
    const running = useAssistantState(({ thread }) => thread.isLoading || thread.isRunning);
    const empty = useAssistantState(({ thread }) => thread.messages.length === 0 && !thread.isLoading);
    const api = useAssistantApi();

    const toggleEmpty = () => {
        if (empty) {
            api.thread().append('Write a 500 word resume on the second world war');
        } else {
            api.thread().reset();
        }
    };

    return (
        <Button
            variant={running ? 'default' : 'ghost'}
            disabled={running}
            size="icon"
            aria-label={t('toggleEmpty')}
            onClick={toggleEmpty}
        >
            <Icon name="CircleX" />
        </Button>
    );
};

export const FloatingAIChatTrigger: React.FC<Omit<React.ComponentProps<typeof Button>, 'aria-label' | 'variant'>> = ({
    ...props
}) => {
    const { t } = useTranslation('p_ai');
    const { open, setOpen } = useFloatingAIChat();

    const handleOpenChange = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            setOpen(!open);
        },
        [open],
    );

    return (
        <>
            <Button
                data-slot="floating-ai-chat-trigger"
                aria-label={t('openAIDiscussion')}
                data-open={open}
                variant={open ? 'secondary' : 'default'}
                size="icon"
                onClick={handleOpenChange}
                {...props}
            >
                <Icon name="Sparkles" className="size-4" />
            </Button>
            {/* {process.env.NODE_ENV === 'development' && <FloatingAIChatDebugButton />} */}
        </>
    );
};

export const FloatingAIChatDialog = () => {
    const running = useAssistantState(({ thread }) => thread.isLoading || thread.isRunning);
    const empty = useAssistantState(({ thread }) => thread.messages.length === 0 && !thread.isLoading);

    const {
        open,
        showAIConversation,
        expandPromptInput,
        setExpandPromptInput,
        setShowAIConversation,
        setShowEssentialConversation,
        setLastSetShowEssentialIsDueToRunning,
        suggestions,
    } = useFloatingAIChat();

    useEffect(() => {
        if (running) {
            setShowEssentialConversation(true);
            setLastSetShowEssentialIsDueToRunning(true);
        }
    }, [running]);

    return (
        <Portal data-slot="dialog-portal">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        transition={{ duration: 0.5 }}
                        data-slot="dialog-content-wrapper"
                        className="pointer-events-none fixed top-0 left-0 z-80 h-screen w-screen"
                        style={{
                            ['--thread-max-width' as string]: '44rem',
                        }}
                    >
                        <AnimatePresence>
                            {expandPromptInput && showAIConversation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: empty ? 0 : 1 }}
                                    exit={{ opacity: 0 }}
                                    data-slot="dialog-overlay"
                                    onClick={() => {
                                        setExpandPromptInput(false);
                                        setShowAIConversation(false);
                                        if (!running) {
                                            setShowEssentialConversation(false);
                                        }
                                    }}
                                    className={cn(
                                        'pointer-events-auto absolute inset-x-0 bottom-0 h-full w-full transition-all duration-400',
                                        'bg-background/30 bg-[linear-gradient(to_right,transparent_calc(50vw-200px-var(--thread-max-width)/2),color-mix(in_oklab,var(--background)_100%,transparent_10%)_calc(50vw-var(--thread-max-width)/2),color-mix(in_oklab,var(--background)_100%,transparent_10%)_calc(50vw+var(--thread-max-width)/2),transparent_calc(50vw+200px+var(--thread-max-width)/2)_100%)] backdrop-blur-[1px]',
                                    )}
                                />
                            )}
                        </AnimatePresence>
                        <motion.div
                            data-slot="dialog-content"
                            className={cn(
                                'absolute bottom-0 left-1/2 flex h-screen w-full max-w-[calc(100%-2rem)] -translate-x-1/2 flex-col sm:max-w-2xl',
                            )}
                        >
                            <Thread suggestions={suggestions} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
};
