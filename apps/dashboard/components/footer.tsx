'use client';

import { SignOutButton } from '@kit/auth/www/ui/sign-out-button';
import { ThemeSwitcher } from '@kit/ui/theme-switcher';
import { dashboardRoutes, marketingRoutes } from '@kit/utils/config';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { appConfig } from '~/config/app.config';

export function Footer(): React.JSX.Element {
    const { t, i18n } = useTranslation('dashboard');

    return (
        <div className="bg-background/40 border-background text-muted-foreground fixed inset-x-0 bottom-0 z-10 mx-auto mt-auto flex w-full max-w-xl min-w-72 flex-row items-center justify-center gap-4 border-t p-4 text-xs backdrop-blur-sm">
            <span>{t('footer.copyright', { year: new Date().getFullYear(), appName: appConfig.name })}</span>
            <Link
                prefetch={false}
                href={marketingRoutes.url + marketingRoutes.paths.lang.termsOfUse.replace('[lang]', i18n.language)}
                className="hidden underline sm:inline"
                rel="noopener noreferrer"
                target="_blank"
            >
                {t('footer.termsOfUse')}
            </Link>
            <Link
                prefetch={false}
                href={marketingRoutes.url + marketingRoutes.paths.lang.privacyPolicy.replace('[lang]', i18n.language)}
                className="hidden underline sm:inline"
                rel="noopener noreferrer"
                target="_blank"
            >
                {t('footer.privacyPolicy')}
            </Link>
            <SignOutButton
                aria-label={t('footer.signOut')}
                type="button"
                variant="link"
                redirectTo={dashboardRoutes.paths.auth.signIn}
                className="text-muted-foreground ml-auto h-fit rounded-none p-0 text-xs font-normal underline"
            >
                {t('footer.signOut')}
            </SignOutButton>
            <ThemeSwitcher />
        </div>
    );
}
