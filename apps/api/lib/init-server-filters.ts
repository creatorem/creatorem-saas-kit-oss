import 'server-only';

import initOrgServerFilters from '@kit/organization/www/server-filters';
import { orgConfig } from '~/config/org.config';

export const initServerFilters = () => {
    initOrgServerFilters({orgConfig});
};
