import { makeAssistantToolUI } from '@assistant-ui/react';
import { AiTool, AiToolErrorItem, AiToolIfCompleted, AiToolLoader, AiToolSuccessItem } from '@kit/ai/ui/ai-tool';
import { Icon } from '@kit/ui/icon';
import { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import { NavigationIcon } from 'lucide-react';
import Link from 'next/link';
import { DASHBOARD_NAVIGATION_TOOL_NAME } from './dn-name';
import { DashboardNavigationArgs, DashboardNavigationResult } from './dn-type';

export const DashboardNavigationToolUI = makeAssistantToolUI<DashboardNavigationArgs, DashboardNavigationResult>({
    toolName: DASHBOARD_NAVIGATION_TOOL_NAME,
    render: ({ args, status, result }) => {
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
