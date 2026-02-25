'use client';

import {
    ActionBarPrimitive,
    BranchPickerPrimitive,
    ComposerPrimitive,
    ErrorPrimitive,
    MessagePrimitive,
    ThreadPrimitive,
    useAssistantApi,
    useAssistantState,
} from '@assistant-ui/react';
import { Button } from '@kit/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useDelay } from '@kit/ui/hooks/use-delay';
import { Icon } from '@kit/ui/icon';
import { InputGroupAddon, InputGroupButton, InputGroupTextarea, inputGroupClassName } from '@kit/ui/input-group';
import { Separator } from '@kit/ui/separator';
import { SpeechInput, SpeechInputCancel, SpeechInputTrigger } from '@kit/ui/speech-input';
import { Switch } from '@kit/ui/switch';
import { TooltipSc } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import * as m from 'motion/react-m';
import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposerAddAttachment, ComposerAttachments, UserMessageAttachments } from './attachment';
import { useFloatingAIChat } from './floating-ai-chat';
import { MarkdownText } from './markdown-text';
import { ShineBorder } from './shine-border';
import { ToolFallback } from './tool-fallback';

interface ThreadProps {
    messageDirection?: 'fromTop' | 'fromBottom';
    noUIAnimation?: boolean;
    suggestions?: Suggestion[];
}

export const Thread: FC<ThreadProps> = ({ messageDirection = 'fromBottom', noUIAnimation = false, suggestions = [] }) => {
    const { t } = useTranslation('p_ai');
    const running = useAssistantState(({ thread }) => thread.isLoading || thread.isRunning);
    const {
        showAIConversation,
        expandPromptInput,
        setShowAIConversation,
        showEssentialConversation,
        lastSetShowEssentialIsDueToRunning,
        setShowEssentialConversation,
        setCanShowAIConversation,
        setExpandPromptInput,
    } = useFloatingAIChat();

    useEffect(() => {
        if (noUIAnimation) {
            setCanShowAIConversation(true);
            setShowAIConversation(true);
            setShowEssentialConversation(false);
        }
    }, [noUIAnimation]);

    const handlePromptInputMouseEnter = useCallback(() => {
        setExpandPromptInput(true);
        setShowEssentialConversation(true);
    }, []);

    const handlePromptInputMouseLeave = useCallback(() => {
        if (!showAIConversation) {
            setExpandPromptInput(false);
            setShowEssentialConversation(false);
        }
    }, [showAIConversation, showEssentialConversation]);

    const displayMessages = useMemo(
        () => showAIConversation || showEssentialConversation,
        [showAIConversation, showEssentialConversation],
    );
    const displayEssential = useMemo(
        () => !showAIConversation && showEssentialConversation,
        [showAIConversation, showEssentialConversation],
    );

    const previousDisplayRef = useRef<{
        isClosing: boolean;
        previousEssentialDisplay: boolean | null;
        essentialDisplay: boolean;
        displayMessages: boolean;
    }>({
        isClosing: false,
        previousEssentialDisplay: null,
        essentialDisplay: displayEssential,
        displayMessages: displayMessages,
    });

    // closing
    if (!displayMessages && previousDisplayRef.current.displayMessages) {
        previousDisplayRef.current.previousEssentialDisplay = previousDisplayRef.current.essentialDisplay;
        previousDisplayRef.current.isClosing = true;
    }
    // opening
    if (displayMessages && !previousDisplayRef.current.displayMessages) {
        previousDisplayRef.current.previousEssentialDisplay = null;
        previousDisplayRef.current.isClosing = false;
    }
    previousDisplayRef.current.essentialDisplay = displayEssential;
    previousDisplayRef.current.displayMessages = displayMessages;

    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">
                <ThreadPrimitive.Root
                    className="aui-root aui-thread-root @container flex h-full flex-col"
                    style={{
                        ['--thread-max-width' as string]: '44rem',
                    }}
                >
                    <ThreadPrimitive.Viewport
                        className={cn(
                            'no-scrollbar relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4',
                        )}
                    >
                        <m.div
                            className={cn(
                                'ai-messages pointer-events-auto transition-opacity',
                                messageDirection === 'fromBottom' && 'mt-auto',
                                displayMessages ? 'pointer-events-auto' : 'pointer-events-none',
                                (
                                    previousDisplayRef.current.isClosing
                                        ? previousDisplayRef.current.previousEssentialDisplay
                                        : displayEssential
                                )
                                    ? {
                                          'ai-message-display-essential-conversation transition-ai-messages': true,
                                          'ai-auto-fade-out-messages':
                                              !running && !expandPromptInput && lastSetShowEssentialIsDueToRunning,
                                      }
                                    : '',
                            )}
                            animate={{
                                opacity: displayMessages ? 1 : 0,
                            }}
                            transition={{
                                duration: displayMessages ? 0.4 : 0.2,
                            }}
                        >
                            <ThreadPrimitive.Messages
                                components={{
                                    UserMessage,
                                    EditComposer,
                                    AssistantMessage,
                                }}
                            />
                        </m.div>

                        {expandPromptInput && (
                            <ThreadPrimitive.If empty={false}>
                                <div
                                    className={cn(
                                        'aui-thread-viewport-spacer min-h-8',
                                        expandPromptInput ? 'pointer-events-auto' : 'pointer-events-none',
                                    )}
                                />
                            </ThreadPrimitive.If>
                        )}

                        <div
                            className="sticky bottom-0 flex w-full flex-col"
                            onMouseEnter={handlePromptInputMouseEnter}
                            onMouseLeave={handlePromptInputMouseLeave}
                        >
                            {expandPromptInput &&
                                (messageDirection === 'fromTop' ? (
                                    <div
                                        className={cn(
                                            'mx-auto mt-auto flex w-full max-w-(--thread-max-width) flex-col',
                                            expandPromptInput ? 'pointer-events-auto' : 'pointer-events-none',
                                        )}
                                    >
                                        <ThreadPrimitive.If empty>
                                            <ThreadSuggestions noUIAnimation={noUIAnimation} suggestions={suggestions} />
                                        </ThreadPrimitive.If>
                                    </div>
                                ) : (
                                    <ThreadPrimitive.If empty>
                                        <div
                                            className={cn(
                                                'mx-auto mt-auto flex w-full max-w-(--thread-max-width) flex-col',
                                                expandPromptInput ? 'pointer-events-auto' : 'pointer-events-none',
                                            )}
                                        >
                                            <ThreadSuggestions noUIAnimation={noUIAnimation} suggestions={suggestions} />
                                        </div>
                                    </ThreadPrimitive.If>
                                ))}

                            <Composer noUIAnimation={noUIAnimation} />
                        </div>
                    </ThreadPrimitive.Viewport>
                </ThreadPrimitive.Root>
            </MotionConfig>
        </LazyMotion>
    );
};

/**
 * Not animated thread.
 *
 * @returns
 */
export const StaticThread: FC<{
    children?: React.ReactNode;
    viewportClassName?: string;
    className?: string;
    suggestions?: Suggestion[];
}> = ({ children = null, viewportClassName = '', className = '', suggestions = [] }) => {
    const empty = useAssistantState(({ thread }) => thread.messages.length === 0 && !thread.isLoading);

    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">
                <ThreadPrimitive.Root
                    className={cn(
                        'aui-root aui-thread-root @container pointer-events-auto flex h-full flex-col',
                        className,
                    )}
                    style={{
                        ['--thread-max-width' as string]: '44rem',
                    }}
                >
                    <ThreadPrimitive.Viewport asChild>
                        <m.div
                            layout
                            className={cn(
                                'relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4',
                                empty ? 'justify-center' : 'justify-between',
                                viewportClassName,
                            )}
                        >
                            <m.div layout className={cn('ai-messages transition-opacity')}>
                                <ThreadPrimitive.If empty>{children}</ThreadPrimitive.If>

                                <ThreadPrimitive.Messages
                                    components={{
                                        UserMessage,
                                        EditComposer,
                                        AssistantMessage,
                                    }}
                                />

                                <ThreadPrimitive.If empty={false}>
                                    <div className={cn('aui-thread-viewport-spacer min-h-8')} />
                                </ThreadPrimitive.If>
                            </m.div>

                            <m.div layout className="sticky bottom-0 flex w-full flex-col">
                                <ThreadSuggestions noUIAnimation visible={empty} suggestions={suggestions} />
                                <Composer noUIAnimation />
                            </m.div>
                        </m.div>
                    </ThreadPrimitive.Viewport>
                </ThreadPrimitive.Root>
            </MotionConfig>
        </LazyMotion>
    );
};

const ThreadScrollToBottom: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <TooltipSc content={t('scrollToBottom')} side="bottom">
            <ThreadPrimitive.ScrollToBottom asChild>
                <Button
                    aria-label={t('scrollToBottom')}
                    variant="outline"
                    size="icon"
                    className="aui-thread-scroll-to-bottom dark:bg-background dark:hover:bg-accent absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible"
                >
                    <Icon name="ArrowDown" />
                </Button>
            </ThreadPrimitive.ScrollToBottom>
        </TooltipSc>
    );
};

export type Suggestion = {
    icon: React.ReactNode;
    title: string;
    prompts: string[];
};

const TRANSITION_DURATION = 0.3;

interface ThreadSuggestionsProps {
    noUIAnimation?: boolean;
    visible?: boolean;
    suggestions?: Suggestion[];
}

const ThreadSuggestions: FC<ThreadSuggestionsProps> = ({ noUIAnimation = false, visible = true, suggestions = [] }) => {
    const { t } = useTranslation('p_ai');
    const [selectedSuggestion, setSelectedSuggestion] = useState<{
        index: number;
        suggestion: Suggestion;
    } | null>(null);
    const { expandPromptInput, setShowAIConversation, setExpandPromptInput } = useFloatingAIChat();
    const isChatOpen = noUIAnimation || expandPromptInput;

    const api = useAssistantApi();

    const sendDisabled = useAssistantState((s) => s.thread.isRunning || !s.composer.isEditing || s.composer.isEmpty);

    const handleMouseEnter = useCallback(
        (prompt: string) => {
            api.composer().setText(prompt);
        },
        [api],
    );

    const handleMouseLeave = useCallback(() => {
        api.composer().setText('');
    }, [api]);

    const handleMouseUp = useCallback(
        (prompt: string) => {
            setSelectedSuggestion(null);
            api.composer().setText(prompt);
            if (!sendDisabled) {
                api.composer().send();
                setExpandPromptInput(true);
                setShowAIConversation(true);
            }
        },
        [api, setSelectedSuggestion, sendDisabled],
    );

    return (
        <div className="relative mx-auto w-full max-w-(--thread-max-width)">
            <AnimatePresence>
                {isChatOpen && selectedSuggestion && visible && (
                    <m.div
                        className="bg-background absolute bottom-0 left-0 mb-4 w-full rounded-md border p-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: TRANSITION_DURATION, delay: 0.1 }}
                    >
                        <div className="flex justify-between">
                            <span
                                className={
                                    'flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 has-[>svg]:px-2.5'
                                }
                                aria-label={selectedSuggestion.suggestion.title}
                                onClick={() => setSelectedSuggestion(null)}
                            >
                                {selectedSuggestion.suggestion.icon}
                                <span className="aui-thread-welcome-suggestion-text-1 font-medium">
                                    {selectedSuggestion.suggestion.title}
                                </span>
                            </span>

                            <Button
                                aria-label={t('close')}
                                variant="ghost"
                                onClick={() => setSelectedSuggestion(null)}
                                size="sm"
                                className="ml-auto size-8"
                            >
                                <Icon name="X" className="size-4" />
                            </Button>
                        </div>
                        <m.div
                            className="flex flex-col divide-y"
                            transition={{ duration: TRANSITION_DURATION }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {selectedSuggestion.suggestion.prompts.map((prompt, index) => (
                                <div
                                    key={index}
                                    onMouseEnter={() => handleMouseEnter(prompt)}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseUp={() => handleMouseUp(prompt)}
                                >
                                    {/* <div className="hover:bg-accent/70 group/suggestion text-muted-foreground flex h-10 cursor-pointer items-center justify-between rounded-md px-2.5 text-sm transition-all duration-200"> */}
                                    <div className="hover:bg-accent/70 group/suggestion text-muted-foreground flex h-10 cursor-pointer items-center justify-between rounded-md px-2.5 text-sm transition-all duration-200">
                                        <span className="whitespace-nowrap">{prompt}</span>
                                        <Icon
                                            name="ChevronRight"
                                            className="group-hover/suggestion:text-muted-foreground size-4 text-transparent"
                                        />
                                    </div>
                                </div>
                            ))}
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {visible &&
                    (isChatOpen && !selectedSuggestion ? (
                        <div className="aui-thread-welcome-suggestions flex w-full justify-center gap-2 pb-2">
                            {suggestions.map((suggestedAction, index) => (
                                <React.Fragment key={index}>
                                    <ThreadSuggestion
                                        index={index}
                                        onSelectSuggestion={setSelectedSuggestion}
                                        suggestion={suggestedAction}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        // display a mock content with the same height to avoid layout shift
                        <div className="h-10 pb-2"></div>
                    ))}
            </AnimatePresence>
        </div>
    );
};

interface ThreadSuggestionProps {
    index: number;
    suggestion: Suggestion;
    onSelectSuggestion: (selectedSuggestion: { index: number; suggestion: Suggestion }) => void;
}

const ThreadSuggestion: FC<ThreadSuggestionProps> = ({ index, suggestion, onSelectSuggestion }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestion.title}-${index}`}
        >
            <Button
                aria-label={suggestion.title}
                onClick={() => onSelectSuggestion({ index, suggestion })}
                variant="outline"
                className="bg-background/80 dark:bg-background/40 backdrop-blur-xs"
                size="sm"
            >
                {suggestion.icon}
                <span className="aui-thread-welcome-suggestion-text-1 font-medium">{suggestion.title}</span>
            </Button>
        </m.div>
    );
};

const Composer: FC<{ noUIAnimation?: boolean }> = ({ noUIAnimation = false }) => {
    const { t } = useTranslation('p_ai');
    const { showAIConversation, setShowAIConversation, expandPromptInput, setExpandPromptInput } = useFloatingAIChat();
    const isChatOpen = noUIAnimation || expandPromptInput;

    const handleMouseDown = useCallback(() => {
        setExpandPromptInput(true);
        setShowAIConversation(true);
    }, [setExpandPromptInput, setShowAIConversation]);

    const api = useAssistantApi();
    const canCancel = useAssistantState(({ composer }) => composer.canCancel);

    const cancelRunningOnEscape = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (canCancel && e.key === 'Escape') {
                api.composer().cancel();
            }
        },
        [canCancel, api],
    );

    return (
        <m.div
            className="aui-composer-wrapper pointer-events-auto mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 overflow-visible pb-4 md:pb-6"
            animate={{
                width: isChatOpen ? '100%' : 260,
            }}
        >
            {(noUIAnimation || showAIConversation) && <ThreadScrollToBottom />}

            <ComposerPrimitive.Root asChild>
                <m.form
                    data-slot="input-group"
                    role="group"
                    animate={{
                        borderRadius: isChatOpen ? 16 : 20,
                        y: isChatOpen ? 0 : 10,
                    }}
                    className={cn(
                        inputGroupClassName,
                        'w-full border-none shadow-md',
                        'mx-auto max-w-full flex-row! rounded-2xl',
                    )}
                    transition={
                        !isChatOpen
                            ? {
                                  type: 'spring',
                                  stiffness: 200,
                                  damping: 20,
                              }
                            : undefined
                    }
                >
                    {/* open border */}
                    <AnimatePresence>
                        {isChatOpen && (
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                                    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                }}
                                className={cn(
                                    'motion-safe:animate-shine bg-opposite/10 pointer-events-none absolute -inset-(--border-width) size-full h-[calc(100%+var(--border-width)*2)] w-[calc(100%+var(--border-width)*2)] rounded-[17px] p-(--border-width) backdrop-blur-[2px] will-change-[background-position] [--border-width:1px]',
                                )}
                            />
                        )}
                    </AnimatePresence>

                    {/* close shine border */}
                    <AnimatePresence>
                        {!isChatOpen && (
                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <ShineBorder
                                    noMask
                                    shineColor="oklch(58% .23 277.07), rgb(131, 58, 180), rgb(253, 29, 29), rgb(252, 176, 69), rgb(253, 187, 45)"
                                    className="-inset-(--border-width) h-[calc(100%+var(--border-width)*2)] w-[calc(100%+var(--border-width)*2)] rounded-[22px] backdrop-blur-[2px]"
                                    borderWidth={3}
                                />
                            </m.div>
                        )}
                    </AnimatePresence>

                    <ComposerAttachments data-slot="composer-attachments" />
                    <ComposerPrimitive.Input asChild>
                        <InputGroupTextarea
                            style={{ boxShadow: 'none' }}
                            className={cn(
                                'no-scrollbar z-1 rounded-[inherit] backdrop-blur-md transition-all duration-200',
                                isChatOpen
                                    ? 'bg-card/30 dark:bg-card/30 min-h-[94px] pb-10.5'
                                    : 'bg-card/60 dark:bg-card/40 min-h-9 pt-2 pl-3.5',
                            )}
                            autoResizeControlledHeight={isChatOpen ? undefined : '36px'}
                            placeholder={t('placeholder')}
                            aria-label={t('placeholderAriaLabel')}
                            data-slot="ai-prompt-input"
                            onMouseDown={handleMouseDown}
                            onKeyDownCapture={cancelRunningOnEscape}
                            autoResize
                        />
                    </ComposerPrimitive.Input>

                    <ComposerAction noUIAnimation={noUIAnimation} />
                </m.form>
            </ComposerPrimitive.Root>
        </m.div>
    );
};

// Tool name to display name and icon mapping
const getToolDisplayConfig = (
    t: (key: string) => string,
): Record<string, { label: string; icon: React.ReactNode }> => ({
    create_product: { label: t('toolCreateProduct'), icon: <Icon name="Plus" className="size-4" /> },
    select_products: { label: t('toolSearchProducts'), icon: <Icon name="Search" className="size-4" /> },
    navigate_through_dashboard: {
        label: t('toolNavigation'),
        icon: <Icon name="Navigation" className="size-4" />,
    },
    deleteProduct: { label: t('toolDeleteProduct'), icon: <Icon name="Trash" className="size-4" /> },
});

const ComposerAction: FC<{ noUIAnimation?: boolean }> = ({ noUIAnimation = false }) => {
    const { t } = useTranslation('p_ai');
    const toolDisplayConfig = useMemo(() => getToolDisplayConfig(t as unknown as (key: string) => string), [t]);
    const {
        expandPromptInput,
        canShowAIConversation,
        setCanShowAIConversation,
        disabledTools,
        setDisabledTools,
        selectedModel,
        setSelectedModel,
        availableModels,
    } = useFloatingAIChat();
    const isChatOpen = noUIAnimation || expandPromptInput;
    const delayedIsChatOpen = useDelay(isChatOpen, 400);

    // Get all available tools from assistant state
    // const toolsObject = useAssistantState((state) => state.toolUIs || {});
    // const toolsObject = useAssistantState((state) => state.tools || {});
    // const availableTools = Object.keys(toolsObject || {});
    const availableTools = ['create_product', 'select_products', 'navigate_through_dashboard', 'deleteProduct'];

    const toggleTool = useCallback(
        (toolId: string) => {
            setDisabledTools((prev) => {
                const next = new Set(prev);
                if (next.has(toolId)) {
                    next.delete(toolId);
                } else {
                    next.add(toolId);
                }
                return next;
            });
        },
        [setDisabledTools],
    );

    const handleModelSelect = useCallback(
        (modelId: string) => {
            setSelectedModel(modelId);
        },
        [setSelectedModel],
    );

    return (
        <div className="absolute right-0 bottom-0 left-0 w-full">
            <AnimatePresence>
                {isChatOpen && (
                    <InputGroupAddon
                        align="block-end"
                        className={cn(
                            'absolute bottom-0 left-0 z-2 w-auto transition-all duration-200',
                            !isChatOpen && 'pointer-events-none pr-1.5 pb-1.5',
                        )}
                    >
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-auto flex items-center gap-2"
                        >
                            <ComposerAddAttachment />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton aria-label={t('enableDisableTools')} variant="ghost">
                                        <Icon name="Settings2" className="size-4" />
                                        {t('tools')}
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="start" className="z-90 w-64 [--radius:0.95rem]">
                                    <DropdownMenuLabel>{t('aiTools')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {availableTools.length === 0 ? (
                                        <DropdownMenuItem disabled>{t('noToolsAvailable')}</DropdownMenuItem>
                                    ) : (
                                        availableTools.map((toolId) => {
                                            const config = toolDisplayConfig[toolId] || {
                                                label: toolId,
                                                icon: <Icon name="Cog" className="size-4" />,
                                            };
                                            return (
                                                <DropdownMenuItem
                                                    key={toolId}
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        toggleTool(toolId);
                                                    }}
                                                    className="flex cursor-pointer items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {config.icon}
                                                        <span>{config.label}</span>
                                                    </div>
                                                    <Switch
                                                        checked={!disabledTools.has(toolId)}
                                                        onCheckedChange={() => toggleTool(toolId)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </DropdownMenuItem>
                                            );
                                        })
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </m.div>
                    </InputGroupAddon>
                )}
            </AnimatePresence>

            <InputGroupAddon
                align="block-end"
                className={cn(
                    'absolute right-0 bottom-0 z-2 w-auto items-center gap-2 transition-all duration-200',
                    !isChatOpen && 'pointer-events-none pr-1.5 pb-1.5',
                )}
            >
                <AnimatePresence>
                    {isChatOpen && (
                        <>
                            {/* Model Selector - only show if multiple models available */}
                            {availableModels.length > 1 && (
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton
                                                aria-label={t('selectAiModel')}
                                                variant="ghost"
                                                className="translate-x-2"
                                            >
                                                {selectedModel ? selectedModel : t('selectModel')}
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side="top"
                                            align="start"
                                            className="z-90 w-64 [--radius:0.95rem]"
                                        >
                                            <DropdownMenuLabel>{t('aiModel')}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {availableModels.map((model) => (
                                                <DropdownMenuItem
                                                    key={model.id}
                                                    onSelect={() => handleModelSelect(model.id)}
                                                    className="flex cursor-pointer items-center justify-between gap-2"
                                                >
                                                    <span>{model.name}</span>
                                                    {selectedModel === model.id && (
                                                        <Icon name="Check" className="text-primary size-4" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </m.div>
                            )}

                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                {/* <InputGroupText className="ml-auto">52% used</InputGroupText> */}
                                {!noUIAnimation && (
                                    <>
                                        <TooltipSc
                                            content={t('showEssentialMessagesOnly')}
                                            disabled={!delayedIsChatOpen}
                                        >
                                            <InputGroupButton
                                                aria-label={t('showEssentialMessagesOnly')}
                                                variant={canShowAIConversation ? 'ghost' : 'secondary'}
                                                size="icon-xs"
                                                onClick={() => {
                                                    setCanShowAIConversation((prev) => !prev);
                                                }}
                                            >
                                                <Icon name="FoldVertical" className="size-3.5" />
                                            </InputGroupButton>
                                        </TooltipSc>
                                        <Separator orientation="vertical" className="!h-4" />
                                    </>
                                )}
                            </m.div>
                        </>
                    )}
                </AnimatePresence>

                <ComposerSubmitAndSpeechButtons noUIAnimation={noUIAnimation} />
            </InputGroupAddon>
        </div>
    );
};

const ComposerSubmitAndSpeechButtons: FC<{ noUIAnimation?: boolean }> = ({ noUIAnimation = false }) => {
    const { t } = useTranslation('p_ai');
    const running = useAssistantState(({ thread }) => thread.isLoading || thread.isRunning);
    const { expandPromptInput, setShowAIConversation } = useFloatingAIChat();
    const composerIsEmpty = useAssistantState(({ thread }) => thread.composer.isEmpty);
    const isChatOpen = noUIAnimation || expandPromptInput;
    const delayedIsChatOpen = useDelay(isChatOpen, 400);

    const [isListening, setIsListening] = useState(false);
    const promptBeforeSpeechRef = useRef('');

    const api = useAssistantApi();

    const handleSpeechStart = useCallback(() => {
        setIsListening(true);
        const before = api.composer().getState().text;
        promptBeforeSpeechRef.current = before;
    }, [api]);

    const handleInterimChange = useCallback(
        (text: string) => {
            api.composer().setText(promptBeforeSpeechRef.current ? `${promptBeforeSpeechRef.current} ${text}` : text);
        },
        [api],
    );

    const handleVoiceTranscript = useCallback(
        (transcript: string) => {
            const newPrompt = promptBeforeSpeechRef.current
                ? `${promptBeforeSpeechRef.current} ${transcript}`
                : transcript;
            api.composer().setText(newPrompt);
            promptBeforeSpeechRef.current = '';
            setIsListening(false);
        },
        [api],
    );

    return (
        <>
            <AnimatePresence>
                {!running && (composerIsEmpty || isChatOpen) && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <SpeechInput
                            onSpeechStart={handleSpeechStart}
                            onSpeechChange={handleVoiceTranscript}
                            onInterimSpeechChange={handleInterimChange}
                        >
                            <TooltipSc content={t('cancelSpeechInput')} disabled={!delayedIsChatOpen}>
                                <SpeechInputCancel
                                    className="size-6 rounded-full"
                                    size="xs"
                                    hideWhenNotListening
                                    disabled={running}
                                />
                            </TooltipSc>
                            <TooltipSc content={t('startSpeechInput')} disabled={!delayedIsChatOpen}>
                                <SpeechInputTrigger className="rounded-full" size="xs" disabled={running} />
                            </TooltipSc>
                        </SpeechInput>
                    </m.div>
                )}
            </AnimatePresence>

            {(running || (!running && !composerIsEmpty && !isListening)) && (
                <>
                    <ThreadPrimitive.If running={false}>
                        <TooltipSc side="bottom" content={t('sendMessageTooltip')} disabled={!delayedIsChatOpen}>
                            <ComposerPrimitive.Send asChild>
                                <InputGroupButton
                                    type="submit"
                                    variant="default"
                                    className="rounded-full"
                                    size="icon-xs"
                                    aria-label={t('sendMessage')}
                                    onClick={() => {
                                        setShowAIConversation(true);
                                    }}
                                >
                                    <Icon name="ArrowUp" />
                                    <span className="sr-only">{t('send')}</span>
                                </InputGroupButton>
                            </ComposerPrimitive.Send>
                        </TooltipSc>
                    </ThreadPrimitive.If>

                    <ThreadPrimitive.If running>
                        <ComposerPrimitive.Cancel asChild>
                            <InputGroupButton
                                type="button"
                                variant="default"
                                size="icon-xs"
                                className="rounded-full"
                                aria-label={t('stopGenerating')}
                            >
                                <Icon name="Square" className="size-3 fill-white dark:fill-black" />
                            </InputGroupButton>
                        </ComposerPrimitive.Cancel>
                    </ThreadPrimitive.If>
                </>
            )}
        </>
    );
};

const MessageError: FC = () => {
    return (
        <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="aui-message-error-root border-destructive bg-destructive/10 text-destructive dark:bg-destructive/5 mt-2 rounded-md border p-3 text-sm dark:text-red-200">
                <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
            </ErrorPrimitive.Root>
        </MessagePrimitive.Error>
    );
};

const AssistantMessage: FC = () => {
    return (
        <MessagePrimitive.Root asChild>
            <div
                className="aui-assistant-message-root animate-in fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-[var(--thread-max-width)] py-4 duration-150 ease-out last:mb-24"
                data-role="assistant"
            >
                <div className="aui-assistant-message-content text-foreground mx-2 leading-7 break-words">
                    <MessagePrimitive.Parts
                        components={{
                            Text: MarkdownText,
                            tools: { Fallback: ToolFallback },
                        }}
                    />
                    <MessageError />
                </div>

                <div className="aui-assistant-message-footer mt-2 ml-2 flex">
                    <BranchPicker />
                    <AssistantActionBar />
                </div>
            </div>
        </MessagePrimitive.Root>
    );
};

const AssistantActionBar: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            autohideFloat="single-branch"
            className="aui-assistant-action-bar-root text-muted-foreground data-floating:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-floating:absolute data-floating:rounded-md data-floating:border data-floating:p-1 data-floating:shadow-sm"
        >
            <MessagePrimitive.If speaking={false}>
                <TooltipSc content={t('readAloud')} side="bottom">
                    <ActionBarPrimitive.Speak asChild>
                        <Button aria-label={t('readAloud')} variant="ghost" size="xs" className="size-6">
                            <Icon name="AudioLines" className="size-3.5" />
                        </Button>
                    </ActionBarPrimitive.Speak>
                </TooltipSc>
            </MessagePrimitive.If>
            <MessagePrimitive.If speaking>
                <TooltipSc content={t('stop')} side="bottom">
                    <ActionBarPrimitive.StopSpeaking asChild>
                        <Button aria-label={t('stop')} variant="ghost" size="xs" className="size-6">
                            <Icon name="StopCircle" className="size-3.5" />
                        </Button>
                    </ActionBarPrimitive.StopSpeaking>
                </TooltipSc>
            </MessagePrimitive.If>

            <TooltipSc content={t('copy')} side="bottom">
                <ActionBarPrimitive.Copy asChild>
                    <Button aria-label={t('copyMessageAction')} variant="ghost" size="xs" className="size-6">
                        <MessagePrimitive.If copied>
                            <Icon name="Check" className="size-3.5" />
                        </MessagePrimitive.If>
                        <MessagePrimitive.If copied={false}>
                            <Icon name="Copy" className="size-3.5" />
                        </MessagePrimitive.If>
                    </Button>
                </ActionBarPrimitive.Copy>
            </TooltipSc>
            <TooltipSc content={t('regenerate')} side="bottom">
                <ActionBarPrimitive.Reload asChild>
                    <Button aria-label={t('regenerate')} variant="ghost" size="xs" className="size-6">
                        <Icon name="RefreshCw" className="size-3.5" />
                    </Button>
                </ActionBarPrimitive.Reload>
            </TooltipSc>
        </ActionBarPrimitive.Root>
    );
};

const UserMessage: FC = () => {
    return (
        <MessagePrimitive.Root asChild>
            <div
                className="aui-user-message-root animate-in fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-150 ease-out first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
                data-role="user"
            >
                <UserMessageAttachments />

                <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
                    <div className="aui-user-message-content bg-muted text-foreground rounded-3xl px-5 py-2.5 break-words">
                        <MessagePrimitive.Parts />
                    </div>
                    <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
                        <UserActionBar />
                    </div>
                </div>

                <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
            </div>
        </MessagePrimitive.Root>
    );
};

const UserActionBar: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="aui-user-action-bar-root flex flex-col items-end"
        >
            <TooltipSc content={t('edit')} side="bottom">
                <ActionBarPrimitive.Edit asChild>
                    <Button
                        className="aui-user-action-edit p-4"
                        aria-label={t('editMessage')}
                        variant="ghost"
                        size="icon"
                    >
                        <Icon name="Pencil" />
                    </Button>
                </ActionBarPrimitive.Edit>
            </TooltipSc>
        </ActionBarPrimitive.Root>
    );
};

const EditComposer: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
            <ComposerPrimitive.Root className="aui-edit-composer-root bg-muted ml-auto flex w-full max-w-7/8 flex-col rounded-xl">
                <ComposerPrimitive.Input
                    className="aui-edit-composer-input text-foreground flex min-h-[60px] w-full resize-none bg-transparent p-4 outline-none"
                    autoFocus
                />

                <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
                    <ComposerPrimitive.Cancel asChild>
                        <Button variant="ghost" size="sm" aria-label={t('cancelEdit')}>
                            {t('cancel')}
                        </Button>
                    </ComposerPrimitive.Cancel>
                    <ComposerPrimitive.Send asChild>
                        <Button size="sm" aria-label={t('updateMessage')}>
                            {t('update')}
                        </Button>
                    </ComposerPrimitive.Send>
                </div>
            </ComposerPrimitive.Root>
        </div>
    );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
    const { t } = useTranslation('p_ai');
    return (
        <BranchPickerPrimitive.Root
            hideWhenSingleBranch
            className={cn(
                'aui-branch-picker-root text-muted-foreground mr-2 -ml-2 inline-flex items-center text-xs',
                className,
            )}
            {...rest}
        >
            <TooltipSc content={t('previousBranch')} side="bottom">
                <BranchPickerPrimitive.Previous asChild>
                    <Button aria-label={t('previousBranch')} variant="ghost" size="xs" className="size-6">
                        <Icon name="ChevronLeft" className="size-3.5" />
                    </Button>
                </BranchPickerPrimitive.Previous>
            </TooltipSc>
            <span className="aui-branch-picker-state font-medium">
                <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
            </span>
            <TooltipSc content={t('nextBranch')} side="bottom">
                <BranchPickerPrimitive.Next asChild>
                    <Button aria-label={t('nextBranch')} variant="ghost" size="xs" className="size-6">
                        <Icon name="ChevronRight" className="size-3.5" />
                    </Button>
                </BranchPickerPrimitive.Next>
            </TooltipSc>
        </BranchPickerPrimitive.Root>
    );
};
