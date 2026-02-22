'use client';

import { FloatingAIChatTrigger } from '@kit/ai/ui/floating-ai-chat';
import { useCtxTrpc } from '@kit/shared/trpc-client-provider';

export const DashboardActionGroup = () => {
    const { clientTrpc } = useCtxTrpc();

    return (
        <>
            {/* <ThemeToggle /> */}
            
            <FloatingAIChatTrigger />
        </>
    );
};
