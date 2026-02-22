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

import { tool } from 'ai';
import { z } from 'zod';

export const consoleLogTool = tool({
    name: 'consoleLogTool',
    description: 'Log a message in the server console. Take a message as input and log it in the server console.',
    inputSchema: z.object({
        message: z.string(),
    }),
    execute: async (params: { message: string }) => {
        console.log('hello world');
        console.log(params.message);

        return {
            success: true,
            data: {
                logged_message: params.message,
            },
        };
    },
});
