'use client';

import { QuickForm } from '@kit/ui/quick-form';
import { Skeleton } from '@kit/ui/skeleton';
import { Tabs, UnderlinedTabsContent, UnderlinedTabsList, UnderlinedTabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FC } from 'react';
import { useMemo } from 'react';
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryParamKey = 'tab';

    const currentTab = useMemo(() => {
        const valueFromQuery = searchParams.get(queryParamKey);

        if (valueFromQuery && tabs.some((tab) => tab.value === valueFromQuery)) {
            return valueFromQuery;
        }

        return defaultValue;
    }, [searchParams, tabs, queryParamKey, defaultValue]);

    const handleTabChange = (nextValue: string) => {
        if (nextValue === currentTab) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set(queryParamKey, nextValue);

        const nextQuery = params.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    return (
        // <div className={cn('', pageHasTitle ? 'pt-2' : 'pt-8')}>
        <div className={cn('pt-1')}>
            <Tabs value={currentTab} onValueChange={handleTabChange} className={cn('w-full gap-0', className)}>
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

                {tabs.map((tab) => (
                    <UnderlinedTabsContent
                        key={`${tabsId}-${tab.value}-content`}
                        value={tab.value}
                        className={cn('mt-0 outline-none space-y-4 px-4 py-8 sm:px-8', tabsContentClassName)}
                    >
                        {tab.content}
                    </UnderlinedTabsContent>
                ))}
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
