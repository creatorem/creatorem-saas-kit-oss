'use client';

import { useAssistantTool } from '@assistant-ui/react';
import { AiTool, AiToolErrorItem, AiToolIfCompleted, AiToolLoader, AiToolSuccessItem } from '@kit/ai/ui/ai-tool';
import { useFloatingAIChat } from '@kit/ai/ui/floating-ai-chat';
import { Icon } from '@kit/ui/icon';
import { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import { logger } from '@kit/utils';
import { NavigationIcon } from 'lucide-react';
import Link from 'next/link';
import { useAppUrl } from '~/hooks/use-app-url';
import { DASHBOARD_NAVIGATION_TOOL_NAME } from './dn-name';
import { DashboardNavigationArgs, dashboardNavigationArgsSchema } from './dn-type';
import { generateDescription } from './utils/generate-description';
import { type DashboardNavigationPath, type DashboardRouteString, resolveRouteFromPath } from './utils/route-generator';

export const useDashboardNavigationTool = ({
    disabled = false,
    onSuccess,
}: {
    disabled?: boolean;
    onSuccess: (redirectUrl: string) => void;
}) => {
    const { url } = useAppUrl();

    useAssistantTool({
        toolName: DASHBOARD_NAVIGATION_TOOL_NAME,
        description:
            'Navigate to different pages in the dashboard. Use this to help users move around the application. The tool takes a page dashboard navigation path string as input. Then it will return the redirect url to the page. It should be used when the user needs to change of page in the dashboard.',
        parameters: dashboardNavigationArgsSchema,
        execute: async (params: DashboardNavigationArgs) => {
            try {
                logger.info({ params }, 'Navigation requested via AI tool');

                // await for 10 seconds
                // await new Promise((resolve) => setTimeout(resolve, 1000000));
                // console.log('10 seconds passed');

                const routePath = params.page as DashboardNavigationPath;
                const routeTemplate: DashboardRouteString = resolveRouteFromPath(routePath);
                const targetUrl = url(routeTemplate);
                const description = generateDescription(routePath);

                onSuccess(targetUrl);

                return {
                    type: 'tool_result',
                    success: true,
                    data: {
                        redirectUrl: targetUrl,
                        page: params.page,
                        description,
                        action: 'navigate',
                        message: description,
                    },
                };
            } catch (error) {
                logger.error({ error, params }, 'Failed to generate navigation via AI tool');
                return {
                    type: 'tool_result',
                    success: false,
                    error: `Failed to navigate to page: ${params.page}. Please try again.`,
                };
            }
        },
        disabled,
        render: ({ args, status, result }) => {
            const { setShowAIConversation } = useFloatingAIChat();
            return (
                <AiTool status={status} name="navigation" whileName="navigating" coverAllStatuses>
                    <AiToolLoader
                        action={
                            <div className="rounded-md border p-2">
                                <Icon name="ShoppingCart" className="size-4" />
                            </div>
                        }
                    >
                        Navigating to {args.page}...
                    </AiToolLoader>

                    <AiToolIfCompleted>
                        {result?.data ? (
                            <AiToolSuccessItem>
                                <Link href={result.data.redirectUrl}>
                                    <ItemMedia>
                                        <NavigationIcon className="size-4" />
                                    </ItemMedia>

                                    <ItemContent>
                                        <ItemTitle>{result.data.description}</ItemTitle>
                                        <ItemDescription>Navigated to {result.data.page}</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Icon name="ArrowRight" className="size-4" />
                                    </ItemActions>
                                </Link>
                            </AiToolSuccessItem>
                        ) : (
                            <AiToolErrorItem>
                                <ItemMedia>
                                    <Icon name="AlertCircle" className="size-4" />
                                </ItemMedia>

                                <ItemContent>
                                    <ItemTitle>No result data found.</ItemTitle>
                                    <ItemDescription>
                                        The `result.data` or `result` object is empty. Please try again.
                                        <br />
                                        The result object is: {JSON.stringify(result)}
                                    </ItemDescription>
                                </ItemContent>
                            </AiToolErrorItem>
                        )}
                    </AiToolIfCompleted>
                </AiTool>
            );
        },
    });
};
