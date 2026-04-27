'use client';

import { QuickForm } from '@kit/ui/quick-form';
import { Skeleton } from '@kit/ui/skeleton';
import { Tabs, UnderlinedTabsContent, UnderlinedTabsList, UnderlinedTabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/utils';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FormWrapperComponent } from '../../shared/components/setting-form-component';
import {
    type SettingsPagesProps,
    type SettingsTabsRendererProps,
    SettingsPages as SharedSettingsPages,
} from '../../shared/components/settings-pages';
import { REGISTERED_SETTINGS_INPUTS } from './registered-settings-inputs';

const FormWrapper: FormWrapperComponent = ({ header, children }) => {
    return (
        <div className="space-y-4 px-4 py-8 sm:px-8">
            {header && <div className="space-y-2">{header}</div>}
            {children}
        </div>
    );
};

const SettingsTabsRenderer: FC<SettingsTabsRendererProps> = ({
    tabsId,
    defaultValue,
    // pageHasTitle,
    className,
    tabsListClassName,
    tabsContentClassName,
    tabs,
}) => {
    const currentDefault = useMemo(() => {
        if (tabs.some((tab) => tab.value === defaultValue)) {
            return defaultValue;
        }
        return tabs[0]?.value ?? defaultValue;
    }, [tabs, defaultValue]);

    const [activeTab, setActiveTab] = useState(currentDefault);
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set([currentDefault]));

    useEffect(() => {
        if (!tabs.some((tab) => tab.value === activeTab)) {
            setActiveTab(currentDefault);
        }
    }, [tabs, activeTab, currentDefault]);

    useEffect(() => {
        setVisitedTabs((previous) => {
            if (previous.has(activeTab)) {
                return previous;
            }

            const next = new Set(previous);
            next.add(activeTab);
            return next;
        });
    }, [activeTab]);

    return (
        // <div className={cn('', pageHasTitle ? 'pt-2' : 'pt-8')}>
        <div className={cn('pt-1')}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className={cn('w-full gap-0', className)}>
                {/* <UnderlinedTabsList className={cn('border-border mb-6 w-full justify-start border-b', tabsListClassName)}> */}
                <div className="px-4 sm:px-8 border-border w-full justify-start border-b">
                    <UnderlinedTabsList className={cn(tabsListClassName)}>
                        {tabs.map((tab) => (
                            <UnderlinedTabsTrigger key={`${tabsId}-${tab.value}`} value={tab.value}>
                                {tab.label}
                            </UnderlinedTabsTrigger>
                        ))}
                    </UnderlinedTabsList>
                </div>

                {tabs.map((tab) =>
                    visitedTabs.has(tab.value) ? (
                        <UnderlinedTabsContent
                            key={`${tabsId}-${tab.value}-content`}
                            forceMount
                            value={tab.value}
                            className={cn(
                                'mt-0 space-y-4 px-4 py-8 outline-none sm:px-8',
                                activeTab !== tab.value && 'hidden',
                                tabsContentClassName,
                            )}
                        >
                            {tab.content}
                        </UnderlinedTabsContent>
                    ) : null,
                )}
            </Tabs>
        </div>
    );
};

export function SettingsPages({
    inputs,
    Wrapper,
    ...props
}: Pick<SettingsPagesProps, 'params' | 'onNotFound' | 'settingsSchemas' | 'settingsUI' | 'clientTrpc' | 'Wrapper'> & {
    inputs?: SettingsPagesProps['inputs'];
}) {
    const SkeletonComponent = () => {
        return (
            <Wrapper
                header={
                    <div className="mb-4 flex flex-col gap-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                }
            >
                <Skeleton className="h-24 w-lg" />
                <Skeleton className="h-24 w-lg" />
                <Skeleton className="h-9 w-24" />
            </Wrapper>
        );
    };
    return (
        <SharedSettingsPages
            {...props}
            inputs={{
                ...REGISTERED_SETTINGS_INPUTS,
                ...inputs,
            }}
            SkeletonComponent={SkeletonComponent}
            Wrapper={Wrapper}
            FormWrapper={FormWrapper}
            QuickForm={QuickForm}
            TabsRenderer={SettingsTabsRenderer}
        />
    );
}
