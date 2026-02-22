import { createTrpcAPI } from '@creatorem/next-trpc/server';
import { appRouter, createRouterContext } from '@kit/shared/server/router';
import { type NextRequest } from 'next/server';
import { initServerFilters } from '~/lib/init-server-filters';

const handler = createTrpcAPI({
    router: appRouter,
    ctx: async (req: NextRequest) => {
        /**
         * Initialize server app events to be able to use them in trpc actions.
         */
        await initServerFilters();
        return createRouterContext(req);
    },
});

export { handler as GET, handler as POST };
