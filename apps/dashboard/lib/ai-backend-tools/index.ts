import 'server-only';

// Export all AI tools for easy importing
export * from './types';

import type { ToolOptions } from './types';
// import { DASHBOARD_NAVIGATION_TOOL_NAME } from './navigation/dn-name';
// import { getDashboardNavigationTool } from './navigation/dashboard-navigation';

// All available tools
export const getAllTools = (options: ToolOptions) => ({
    // [DASHBOARD_NAVIGATION_TOOL_NAME]: getDashboardNavigationTool(options),
});
