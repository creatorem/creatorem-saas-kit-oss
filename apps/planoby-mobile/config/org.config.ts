import { parseOrgConfig } from '@kit/organization/config';
import { dashboardRoutes } from '@planoby/shared/config/routes';

export const orgConfig = parseOrgConfig({
    environment: 'native',
    urls: {
        organizationRoot: dashboardRoutes.paths.dashboard.index,
    },
});
