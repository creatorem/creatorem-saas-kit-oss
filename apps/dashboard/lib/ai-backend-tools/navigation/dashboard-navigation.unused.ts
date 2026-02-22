/**
 * Dashboard Navigation Tool
 * This tool is used to navigate to different pages in the dashboard.
 *
 * Example of use:
 * "Navigate to the orders page"
 * "Navigate to the products page"
 * "Navigate to the clients page"
 * "Navigate to the settings page"
 * "Navigate to the ai-chat page"
 * See for more details on how set a tool : https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use
 *
 * Example of good description:
 * "Retrieves the current stock price for a given ticker symbol.
 * The ticker symbol must be a valid symbol for a publicly traded
 * company on a major US stock exchange like NYSE or NASDAQ. The
 * tool will return the latest trade price in USD. It should be
 * used when the user asks about the current or most recent price
 * of a specific stock. It will not provide any other information
 * about the stock or company."
 */

import { logger } from '@kit/utils';
import { tool } from 'ai';
import { type ToolOptions } from '../types';
import { type DashboardNavigationArgs, type DashboardNavigationResult, dashboardNavigationArgsSchema } from './dn-type';
import { generateDescription } from './utils/generate-description';
import { type DashboardNavigationPath, type DashboardRouteString, resolveRouteFromPath } from './utils/route-generator';

export const getDashboardNavigationTool = (options: ToolOptions) => {
    return tool<DashboardNavigationArgs, DashboardNavigationResult>({
        description:
            'Navigate to different pages in the dashboard. Use this to help users move around the application. The tool takes a page dashboard navigation path string as input. Then it will return the redirect url to the page. It should be used when the user needs to change of page in the dashboard.',
        inputSchema: dashboardNavigationArgsSchema,
        execute: async (params: DashboardNavigationArgs) => {
            try {
                logger.info({ params }, 'Navigation requested via AI tool');
                // await for 10 seconds
                // await new Promise((resolve) => setTimeout(resolve, 1000000));
                // console.log('10 seconds passed');

                const routePath = params.page as DashboardNavigationPath;
                const routeTemplate: DashboardRouteString = resolveRouteFromPath(routePath);
                const targetUrl = await options.getUrl(routeTemplate);
                const description = generateDescription(routePath);

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
    });
};
