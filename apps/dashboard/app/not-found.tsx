'use client';

import { Button } from '@kit/ui/button';
import { marketingRoutes } from '@kit/utils/config';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NotFound(): React.JSX.Element {
    const router = useRouter();
    const { t } = useTranslation('dashboard');

    const handleGoBack = (): void => {
        router.back();
    };
    const handleBackToHome = (): void => {
        router.push(marketingRoutes.url);
    };
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-[10rem] leading-none font-semibold">404</span>
            <h2 className="my-2 text-2xl font-bold">{t('errors.pageNotFound')}</h2>
            <p>{t('errors.pageNotFoundDescription')}</p>
            <div className="mt-8 flex justify-center gap-2">
                <Button
                    aria-label={t('errors.goBack')}
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={handleGoBack}
                >
                    {t('errors.goBack')}
                </Button>
                <Button
                    aria-label={t('errors.backToHome')}
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleBackToHome}
                >
                    {t('errors.backToHome')}
                </Button>
            </div>
        </div>
    );
}
