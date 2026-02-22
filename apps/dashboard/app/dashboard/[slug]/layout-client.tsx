'use client';

import NiceModal from '@ebay/nice-modal-react';
import { TrpcClientProvider, useCtxTrpc } from '@kit/shared/trpc-client-provider';
import { SidebarInset } from '@kit/ui/sidebar';
import { FilterApplier } from '@kit/utils/filters';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import React from 'react';
import { DashboardSidebarProvider } from '~/components/dashboard/dashboard';
import { SidebarRenderer } from '~/components/dashboard/sidebar-renderer';
import { LogoLoader } from '~/components/logo-loader';
import { AIAssistantProvider } from '~/components/providers/ai-assistant-provider';
import { envs } from '~/envs';
import { useAppUrl } from '~/hooks/use-app-url';
import { clientTrpc as rootClientTrpc } from '~/trpc/client';

interface LayoutClientProps {
    children: React.ReactNode;
}

function InnerTrpcClient({ children }: LayoutClientProps): React.JSX.Element {
    const { clientTrpc } = useCtxTrpc();
    const { url } = useAppUrl();

    return (
        <FilterApplier
            name="display_trpc_provider_child_in_dashboard"
            options={{
                url,
                clientTrpc,
            }}
        >
            
            <AIAssistantProvider>
                <NiceModal.Provider>
                    <div className="flex size-full flex-col">
                        <DashboardSidebarProvider>
                            <SidebarRenderer />
                            <SidebarInset
                                id="skip"
                                className="size-full lg:[transition:max-width_0.2s_linear] lg:peer-data-[state=collapsed]:max-w-[calc(100svw-var(--sidebar-width-icon))] lg:peer-data-[state=expanded]:max-w-[calc(100svw-var(--sidebar-width))]"
                            >
                                {children}
                            </SidebarInset>
                        </DashboardSidebarProvider>
                    </div>
                </NiceModal.Provider>
            </AIAssistantProvider>
        </FilterApplier>
    );
}

export function LayoutClient({ children }: LayoutClientProps): React.JSX.Element {
    const params = useParams<{ slug: string }>();
    return (
        <FilterApplier
            name="display_trpc_provider_wrapper_in_dashboard"
            options={{
                slug: params.slug,
                clientTrpc: rootClientTrpc,
                loader: (
                    <motion.div
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="animate-in fade-in bg-background fixed inset-0 z-2000 flex h-screen w-screen flex-col items-center justify-center gap-6"
                    >
                        <LogoLoader />
                    </motion.div>
                ),
            }}
        >
            <TrpcClientProvider url={`${envs().NEXT_PUBLIC_DASHBOARD_URL}/api/trpc`}>
                <InnerTrpcClient>{children}</InnerTrpcClient>
            </TrpcClientProvider>
        </FilterApplier>
    );
}
