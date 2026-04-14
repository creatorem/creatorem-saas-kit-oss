import useAuthFilters from '@kit/auth/native/use-filters';
import useOrgFilters from '@kit/organization/native/use-filters';
import { orgConfig } from '~/config/org.config';
import { clientTrpc } from '~/utils/trpc-client';

export const useFilters = () => {
    useOrgFilters({ clientTrpc, orgConfig });
    useAuthFilters();
};
