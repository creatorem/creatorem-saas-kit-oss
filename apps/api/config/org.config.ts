import { parseOrgConfig } from '@kit/organization/config';
import { dashboardRoutes } from '@kit/shared/config/routes';

export const orgConfig = parseOrgConfig({
    environment: 'www',
    urls: {
        organizationRoot: dashboardRoutes.paths.dashboard.index,
        onboarding: dashboardRoutes.paths.onboarding
    },
});
