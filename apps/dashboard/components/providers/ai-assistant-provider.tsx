'use client';

import { AssistantRuntimeProvider, useAssistantInstructions } from '@assistant-ui/react';
import { AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import { useChatRuntime } from '@kit/ai/hooks/use-chat-runtime';
import { FloatingAIChatDialog, FloatingAIChatProvider, useFloatingAIChat } from '@kit/ai/ui/floating-ai-chat';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { useLocalStorage } from '@kit/ui/hooks/use-local-storage';
import { Icon } from '@kit/ui/icon';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import { dashboardRoutes } from '@kit/shared/config/routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import z from 'zod';
import { aiConfig } from '~/config/ai.config';
import { billingConfig } from '~/config/billing.config.stripe';
import { useAppUrl } from '~/hooks/use-app-url';
import { DASHBOARD_NAVIGATION_TOOL_NAME } from '~/lib/ai-backend-tools/navigation/dn-name';
import { useDashboardNavigationTool } from '~/lib/ai-backend-tools/navigation/use-dashboard-navigation-tool';
import { clientTrpc } from '~/trpc/client';

/**
 * Sub-component that registers AI tools conditionally based on disabledTools state
 * Must be rendered inside FloatingAIChatProvider to access the context
 * All tools are enabled by default unless they are in the disabledTools set
 */
const AIToolsRegistry = () => {
    const { disabledTools, setShowAIConversation } = useFloatingAIChat();
    const router = useRouter();

    useAssistantInstructions(
        aiConfig.globalContext || 'You are a helpful assistant that can help to interact with the dashboard.',
    );

    useDashboardNavigationTool({
        disabled: disabledTools.has(DASHBOARD_NAVIGATION_TOOL_NAME),
        onSuccess: (redirectUrl) => {
            setShowAIConversation(false);
            router.push(redirectUrl);
        },
    });

    return (
        <>
            {/* register your tool UI here */}
        </>
    );
};

interface AIUsageLimitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    includedAmount: string;
}

const AIUsageLimitDialog = ({ open, onOpenChange, includedAmount }: AIUsageLimitDialogProps) => {
    const { setOpen: setChatOpen, setShowAIConversation } = useFloatingAIChat();
    const { url } = useAppUrl();

    const handleClose = () => {
        onOpenChange(false);
        setChatOpen(false);
        setShowAIConversation(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogPortal>
                <AlertDialogOverlay className="z-110" />
                <AlertDialogContent className="z-110">
                    <AlertDialogHeader>
                        <AlertDialogTitle>AI Usage Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            You have reached your AI usage limit of{' '}
                            {Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: billingConfig.currency,
                            }).format(Number(includedAmount))}{' '}
                            for this billing period.
                        </AlertDialogDescription>

                        <Item variant="outline" className="bg-card hover:bg-accent rounded-lg" size="sm" asChild>
                            <Link
                                href={url(dashboardRoutes.paths.dashboard.slug.settings.organization.billing)}
                                onClick={handleClose}
                            >
                                <ItemMedia>
                                    <Icon name="Rocket" className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Upgrade your plan</ItemTitle>
                                    <ItemDescription>
                                        You can upgrade your plan to get more AI credits, or enable custom AI usage to
                                        continue using AI features beyond your plan's included amount.
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Icon name="ChevronRight" className="size-4" />
                                </ItemActions>{' '}
                            </Link>
                        </Item>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel className="w-full sm:w-auto">Close</AlertDialogCancel>
                        <AlertDialogAction className="w-full sm:w-auto" asChild>
                            <Link
                                onClick={handleClose}
                                href={url(dashboardRoutes.paths.dashboard.slug.settings.organization.billing)}
                            >
                                Go to Billing Settings
                            </Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    );
};

export const AIAssistantProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    // State for usage limit dialog
    const [showUsageLimitDialog, setShowUsageLimitDialog] = useState(false);
    const [includedAmount, setIncludedAmount] = useState('');

    // Use defaultModel from config if available, otherwise use first available model
    const initialModel =
        aiConfig.defaultModel ||
        (aiConfig.availableModels.length > 0 ? (aiConfig.availableModels[0]?.id ?? null) : null);

    // Persist selected model in localStorage
    const [selectedModel, setSelectedModel] = useLocalStorage<string | null>('ai-selected-model', initialModel);

    // Persist disabled tools in localStorage with custom serialization for Set
    const [disabledTools, setDisabledTools] = useLocalStorage<Set<string>>('ai-disabled-tools', new Set(), {
        serializer: (value: Set<string>) => JSON.stringify(Array.from(value)),
        deserializer: (value: string) => new Set(JSON.parse(value) as string[]),
    });

    const disabledToolsRef = useRef(disabledTools);
    const selectedModelRef = useRef(selectedModel);
    disabledToolsRef.current = disabledTools;
    selectedModelRef.current = selectedModel;

    // Create transport - body function is called on each request
    const transport = useMemo(() => {
        return new AssistantChatTransport({
            api: '/api/chat',
            body: () => ({
                disabledTools: Array.from(disabledToolsRef.current),
                selectedModel: selectedModelRef.current,
            }),
        });
    }, []);

    const runtime = useChatRuntime({
        clientTrpc,
        transport,
        onData: (data) => {
            console.log('Assistant UI data', data);
            // toast.success('Assistant is thinking...', data);
        },
        onToolCall: (toolCall) => {
            console.log('Assistant UI toolCall', toolCall);
            if (process.env.NODE_ENV === 'development') {
                // toast.success('Assistant is calling a tool...');
            }
        },
        onError: (error) => {
            console.log('Assistant UI error', error);

            // Check if it's a usage limit error (429 status)
            const errorMessage = error?.message || String(error);
            console.log('errorMessage => ', errorMessage);

            // Check if error contains usage limit message
            if (errorMessage.includes('[AI usage limit exceeded]')) {
                const parsedError = z
                    .object({
                        error: z.string(),
                        includedAmount: z.string(),
                    })
                    .parse(JSON.parse(errorMessage));

                setIncludedAmount(parsedError.includedAmount);
                setShowUsageLimitDialog(true);
                return; // Don't show toast for usage limit errors
            }

            // toast.error('Assistant encountered an error...');
        },
        onFinish: (finish) => {
            console.log('Assistant UI finish', finish);

            const parts = [...finish.message.parts].reverse();
            for (const part of parts) {
                if (part.type.startsWith('tool-') && 'output' in part && typeof part.output === 'object') {
                    const output = part.output as { data?: { redirectUrl?: string } };
                    const redirectUrl = output.data?.redirectUrl;
                    if (redirectUrl) {
                        router.push(redirectUrl);
                        return;
                    }
                }
                if (part.type === 'text' && part.text.startsWith('{')) {
                    const json = JSON.parse(part.text);
                    if (json.type === 'tool_result' && json.data?.redirectUrl) {
                        router.push(json.data.redirectUrl);
                        return;
                    }
                }
            }

            if (process.env.NODE_ENV === 'development') {
                // toast.success('Assistant has finished...');
            }
        },
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <FloatingAIChatProvider
                disabledTools={disabledTools}
                setDisabledTools={setDisabledTools}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={aiConfig.availableModels}
                defaultModel={aiConfig.defaultModel}
            >
                <AIToolsRegistry />

                {children}

                <AIUsageLimitDialog
                    open={showUsageLimitDialog}
                    onOpenChange={setShowUsageLimitDialog}
                    includedAmount={includedAmount}
                />
                <FloatingAIChatDialog />
            </FloatingAIChatProvider>
        </AssistantRuntimeProvider>
    );
};
