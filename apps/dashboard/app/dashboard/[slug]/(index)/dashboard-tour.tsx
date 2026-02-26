'use client';

import {
    Tour,
    TourArrow,
    TourClose,
    TourContent,
    TourDescription,
    TourFrame,
    TourNext,
    TourOverlay,
    TourPortal,
    TourPrevious,
    TourProgress,
    type TourStep,
    TourTitle,
} from '@kit/ui/tour';
import { dashboardRoutes } from '@kit/shared/config/routes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppUrl } from '~/hooks/use-app-url';

interface DashboardTourProps {
    shouldStartTour: boolean;
}

export function DashboardTour({ shouldStartTour }: DashboardTourProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { url } = useAppUrl();
    const { t } = useTranslation('tour');

    const steps: [TourStep, ...TourStep[]] = [
        {
            title: t('steps.welcome.title'),
            description: t('steps.welcome.description'),
            dialogDisplay: true,
            dialogPosition: 'center',
        },
        {
            element: '[data-slot="floating-ai-chat-trigger"]',
            title: t('steps.aiAssistant.title'),
            description: t('steps.aiAssistant.description'),
            side: 'left',
            align: 'start',
            interactWithActiveElement: true,
            nextHandledInElementClick: true,
            onElementClick: async (event, options) => {
                const target = event.target;
                console.log(target);
                if (!target || !(target instanceof HTMLElement)) {
                    return await options.moveNext();
                }
                const aiChatTrigger = target.closest('[data-slot="floating-ai-chat-trigger"]');
                if (!aiChatTrigger || !(aiChatTrigger instanceof HTMLElement)) {
                    throw new Error('AI chat trigger not found');
                }
                const open = aiChatTrigger.getAttribute('data-open');
                if (open === 'false') {
                    return await options.moveNext();
                }
            },
            display: ['noNext'],
        },
        {
            element: '[data-slot="ai-prompt-input"]',
            title: t('steps.aiPromptInput.title'),
            description: t('steps.aiPromptInput.description'),
            side: 'bottom',
            align: 'center',
            waitToGetElement: 500,
        },
        {
            element: '[data-slot="search-trigger"]',
            title: t('steps.quickSearch.title'),
            description: t('steps.quickSearch.description'),
            side: 'bottom',
            align: 'center',
        },
        {
            title: t('steps.allSet.title'),
            description: t('steps.allSet.description'),
            dialogDisplay: true,
            dialogPosition: 'center',
        },
    ];

    useEffect(() => {
        if (shouldStartTour) {
            // Small delay to ensure DOM elements are ready
            const timer = setTimeout(() => {
                setOpen(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [shouldStartTour]);

    return (
        <Tour
            config={{
                steps,
                stagePadding: 8,
                stageRadius: 12,
            }}
            open={open}
            onOpenChange={setOpen}
        >
            {/* <TourTrigger asChild>
                <Button aria-label="Click me">Click me</Button>
            </TourTrigger> */}
            <TourPortal>
                <TourOverlay className="bg-black/40 backdrop-blur-[2px]" />
                <TourFrame />
                <TourContent>
                    <TourArrow />
                    <TourProgress />
                    <TourTitle />
                    <TourDescription />

                    <div className="flex w-full flex-row-reverse justify-between gap-2">
                        <div className="flex flex-row-reverse gap-2">
                            <TourNext />
                            <TourPrevious />
                        </div>
                        <TourClose />
                    </div>
                </TourContent>
            </TourPortal>
        </Tour>
    );
}
