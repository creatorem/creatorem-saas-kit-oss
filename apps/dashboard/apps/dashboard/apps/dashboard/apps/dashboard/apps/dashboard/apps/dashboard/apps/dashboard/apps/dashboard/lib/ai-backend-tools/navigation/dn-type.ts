import { z } from 'zod';
import { getPageEnumValues } from './utils/route-generator';

const pageEnumValues = getPageEnumValues();

export const dashboardNavigationArgsSchema = z.object({
    page: z.enum(pageEnumValues as [string, ...string[]]).describe('The page to navigate to'),
});

export type DashboardNavigationArgs = z.infer<typeof dashboardNavigationArgsSchema>;

export type DashboardNavigationResult = {
    type: 'tool_result';
    success: boolean;
    data?: {
        redirectUrl: string;
        page: string;
        description: string;
        action: 'navigate';
        message: string;
    };
    error?: string;
};
