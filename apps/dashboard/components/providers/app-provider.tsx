'use client';

import NiceModal from '@ebay/nice-modal-react';
import { I18nProvider } from '@kit/i18n/shared/provider';
import { TooltipProvider } from '@kit/ui/tooltip';
import { FilterApplier } from '@kit/utils/filters';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import { analytics } from '~/config/analytics.config';
import { i18nConfig } from '~/config/i18n.config';
import { InitClientFilters } from '~/hooks/init-client-filters';
import { AuthProvider } from './auth-provider';
import { ReactQueryProvider } from './react-query-provider';

export function AppProvider({ children, lang }: React.PropsWithChildren<{ lang: string }>): React.JSX.Element {
    return (
        <ReactQueryProvider>
            <NiceModal.Provider>
                <I18nProvider config={i18nConfig} lang={lang}>
                    <InitClientFilters>
                        <FilterApplier name="display_app_provider" options={{ analytics }}>
                            <NuqsAdapter>
                                <AuthProvider>
                                    <ThemeProvider
                                        attribute="class"
                                        defaultTheme="system"
                                        enableSystem
                                        disableTransitionOnChange
                                    >
                                        <NextTopLoader
                                            color={'var(--primary)'}
                                            height={4}
                                            shadow={false}
                                            showSpinner={false}
                                        />
                                        <TooltipProvider>{children}</TooltipProvider>
                                    </ThemeProvider>
                                </AuthProvider>
                            </NuqsAdapter>
                        </FilterApplier>
                    </InitClientFilters>
                </I18nProvider>
            </NiceModal.Provider>
        </ReactQueryProvider>
    );
}
