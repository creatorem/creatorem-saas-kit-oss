'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { SettingsInputsBase, SettingWrapperComponent } from '@kit/utils/quick-form';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SettingsSchema } from '../../config/parse-schema-config';
import type { parseUISettingConfig } from '../../config/parse-ui-config';
import { useClientSettings } from '../client/use-client-settings';
// import type { getSettingsValuesAction, getSettingsValuesSchema } from '../../router/get-settings-values';
import type { settingsRouter } from '../../router/router';
import {
    isFormConfig,
    isLogicInputConfig,
    isQuickFormInputConfig,
    isQuickFormUIComponent,
    isQuickFormWrapperConfig,
    SettingModel,
} from '../../shared/setting-model';
import { isGroupConfig, isPageConfig, isTabsConfig, PageConfig, PageSettingConfig, UIConfig } from '../../shared/type';
import { SettingFormComponent, type SettingFormComponentProps } from './setting-form-component';

export interface SettingsTabsRendererProps {
    tabsId: string;
    defaultValue: string;
    pageHasTitle?: boolean;
    className?: string;
    tabsListClassName?: string;
    tabsContentClassName?: string;
    tabs: {
        value: string;
        label: React.ReactNode | string;
        content: React.ReactNode;
    }[];
}

export interface SettingsPagesProps extends Pick<SettingFormComponentProps, 'inputs' | 'QuickForm' | 'FormWrapper'> {
    params: {
        settings: string[];
    };
    onNotFound?: () => void;
    Wrapper: SettingWrapperComponent;
    clientTrpc: TrpcClientWithQuery<typeof settingsRouter>;
    SkeletonComponent: React.FC;
    settingsSchemas: SettingsSchema;
    settingsUI: ReturnType<typeof parseUISettingConfig>;
    TabsRenderer?: React.ComponentType<SettingsTabsRendererProps>;
}

const getLocalSettingConfig = (
    settings: string | string[],
    model: SettingModel<Record<string, any>, SettingsInputsBase>,
) => {
    // Extract segments from params
    const segments = settings ? (Array.isArray(settings) ? settings : [settings]) : [];

    const uiConfig = model.getUIConfig();

    // Use the findPageConfigByPath method to get the page config
    const pageConfig = segments.length > 0 ? model.findPageConfigByPath(segments) : undefined;

    // If no page config found and there are segments, return empty result
    if (!pageConfig && segments.length > 0) {
        return { currentConfig: undefined };
    }

    // If no segments, find the first page config
    if (!pageConfig && segments.length === 0) {
        // Find the first available page
        const findFirstPage = (
            configs: UIConfig<Record<string, any>, any>,
        ): PageConfig<Record<string, any>, any> | undefined => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    return config;
                } else if (isGroupConfig(config) && config.settingsPages.length > 0) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const found = findFirstPage(config.settingsPages);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        };

        const config = findFirstPage(uiConfig);
        return { currentConfig: config };
    }

    // If we found a page config, build the breadcrumbs
    if (pageConfig) {
        return { currentConfig: pageConfig };
    }

    return { currentConfig: undefined };
};

type CurrentSettingsContextType = {
    config: PageConfig<Record<string, any>, SettingsInputsBase> | null;
    setConfig: (c: PageConfig<Record<string, any>, SettingsInputsBase> | null) => void;
};

const CurrentSettings = React.createContext<CurrentSettingsContextType>({
    config: null,
    setConfig: () => { },
});

// no error if not defined
export const useCurrentSettings = (): CurrentSettingsContextType => {
    const ctx = useContext(CurrentSettings);
    if (!ctx) {
        throw new Error('CurrentSettings context not found');
    }
    return ctx;
};

export const CurrentSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [config, setConfig] = useState<PageConfig<Record<string, any>, SettingsInputsBase> | null>(null);
    return <CurrentSettings.Provider value={{ config, setConfig }}>{children}</CurrentSettings.Provider>;
};

export function SettingsPages({ params, onNotFound, settingsSchemas, settingsUI, ...props }: SettingsPagesProps) {
    // Find the current page config based on URL segments
    const model = new SettingModel<Record<string, any>, SettingsInputsBase>(settingsSchemas, settingsUI);
    const { currentConfig } = getLocalSettingConfig(params.settings, model);
    const { currentConfig: fallbackConfig } = getLocalSettingConfig([], model);
    const existingContext = useContext(CurrentSettings);
    const resolvedConfig = currentConfig ?? (onNotFound ? undefined : fallbackConfig);

    // Render the settings page if we have a valid page config
    if (resolvedConfig && isPageConfig(resolvedConfig)) {
        const children = <SettingsPageRenderer {...props} model={model} pageConfig={resolvedConfig} />;

        if (existingContext === null) {
            return <CurrentSettingsProvider>{children}</CurrentSettingsProvider>;
        }

        return children;
    }

    onNotFound?.();
}

interface SettingsPageRendererProps
    extends Pick<
        SettingsPagesProps,
        'Wrapper' | 'clientTrpc' | 'inputs' | 'QuickForm' | 'FormWrapper' | 'SkeletonComponent' | 'TabsRenderer'
    > {
    pageConfig: PageConfig<Record<string, any>, SettingsInputsBase>;
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
}

function SettingsPageRenderer({ pageConfig, ...props }: SettingsPageRendererProps) {
    const { setConfig } = useCurrentSettings();
    const hasTabs = useMemo(() => {
        return pageConfig.settings.some((setting) => isTabsConfig(setting));
    }, [pageConfig.settings]);

    useEffect(() => {
        setConfig(pageConfig);
    }, [setConfig, pageConfig]);

    const pageTitle = pageConfig.title?.trim();

    return (
        <>
            {/* {hasTabs && pageTitle ? (
                <div className="px-4 pt-8 sm:px-8">
                    <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                </div>
            ) : null} */}

            {pageConfig.settings.map((setting, index) =>
                renderSetting({
                    setting,
                    index,
                    keyPrefix: 'setting',
                    depth: 0,
                    // pageHasTitle: Boolean(hasTabs && pageTitle),
                    ...props,
                }),
            )}
        </>
    );
}

// Helper function to render individual settings
function renderSetting({
    setting,
    index,
    keyPrefix,
    // pageHasTitle,
    Wrapper,
    TabsRenderer,
    depth,
    ...props
}: {
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
    setting: PageSettingConfig<Record<string, any>, SettingsInputsBase>;
    index: number;
    keyPrefix: string;
    depth: number;
    // pageHasTitle: boolean;
} & Pick<
    SettingsPagesProps,
    'Wrapper' | 'clientTrpc' | 'inputs' | 'QuickForm' | 'FormWrapper' | 'SkeletonComponent' | 'TabsRenderer'
>): React.ReactNode {
    const key = `${keyPrefix}-${index}`;

    if (isTabsConfig(setting)) {
        if (setting.tabs.length === 0) {
            return null;
        }

        const resolvedDefaultValue = setting.tabs.some((tab) => tab.value === setting.defaultValue)
            ? (setting.defaultValue as string)
            : setting.tabs[0]!.value;

        const renderedTabs = setting.tabs.map((tab, tabIndex) => ({
            value: tab.value,
            label: tab.label,
            content: (
                <React.Fragment key={`${key}-tab-content-${tab.value}`}>
                    {tab.settings.map((tabSetting, nestedIndex) =>
                        renderSetting({
                            setting: tabSetting,
                            index: nestedIndex,
                            keyPrefix: `${key}-tab-${tabIndex}`,
                            depth,
                            // pageHasTitle,
                            Wrapper,
                            TabsRenderer,
                            ...props,
                        }),
                    )}
                </React.Fragment>
            ),
        }));

        if (TabsRenderer) {
            return (
                <TabsRenderer
                    key={key}
                    tabsId={setting.id}
                    defaultValue={resolvedDefaultValue}
                    // pageHasTitle={pageHasTitle}
                    className={setting.className}
                    tabsListClassName={setting.tabsListClassName}
                    tabsContentClassName={setting.tabsContentClassName}
                    tabs={renderedTabs}
                />
            );
        }

        const fallbackContent = renderedTabs.map((tab) => <React.Fragment key={`${key}-fallback-${tab.value}`}>{tab.content}</React.Fragment>);

        if (setting.className) {
            return (
                <div key={key} className={setting.className}>
                    {fallbackContent}
                </div>
            );
        }

        return <React.Fragment key={key}>{fallbackContent}</React.Fragment>;
    }

    const quickFormSetting = setting as any;

    // Handle UI components
    if (isQuickFormUIComponent(quickFormSetting)) {
        return <React.Fragment key={key}>{quickFormSetting.render}</React.Fragment>;
    }

    // Handle form configurations
    if (isFormConfig(quickFormSetting)) {
        return (
            <React.Fragment key={key}>
                <SettingsFormInitializer {...props} formId={quickFormSetting.id} Wrapper={Wrapper} />
            </React.Fragment>
        );
    }

    // Handle wrapper configurations
    if (isQuickFormWrapperConfig(quickFormSetting)) {
        return (
            <React.Fragment key={key}>
                <Wrapper
                    wrapperType={quickFormSetting.wrapperType}
                    header={quickFormSetting.header}
                    footer={quickFormSetting.footer}
                    className={quickFormSetting.className}
                    sectionClassName={quickFormSetting.sectionClassName}
                    sectionInnerClassName={quickFormSetting.sectionInnerClassName}
                    depth={depth}
                >
                    {quickFormSetting.settings.map((nestedSetting: any, nestedIndex: number) =>
                        renderSetting({
                            setting: nestedSetting,
                            index: nestedIndex,
                            keyPrefix: `${key}-nested`,
                            depth: depth + 1,
                            // pageHasTitle,
                            Wrapper,
                            TabsRenderer,
                            ...props,
                        }),
                    )}
                </Wrapper>
            </React.Fragment>
        );
    }

    // Handle regular input settings - these need to be wrapped in a form
    if (isQuickFormInputConfig(quickFormSetting)) {
        console.warn(
            `Setting '${quickFormSetting.slug}' found outside of form context. ` +
            'Consider wrapping individual settings in a form configuration.',
        );
        return null;
    }

    // Handle confirmation input settings - these also need to be wrapped in a form
    if (isLogicInputConfig(quickFormSetting)) {
        console.warn(
            `Confirmation input '${quickFormSetting.name}' found outside of form context. ` +
            'Consider wrapping individual settings in a form configuration.',
        );
        return null;
    }

    return null;
}

interface SettingsFormInitializerProps
    extends Pick<
        SettingsPagesProps,
        'clientTrpc' | 'Wrapper' | 'SkeletonComponent' | 'inputs' | 'QuickForm' | 'FormWrapper'
    > {
    formId: string;
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
}

function SettingsFormInitializer({
    formId,
    clientTrpc,
    model,
    Wrapper,
    SkeletonComponent,
    ...props
}: SettingsFormInitializerProps) {
    const settingKeys = useMemo(() => {
        const formConfig = model.findFormConfigById(formId);
        if (!formConfig) {
            throw new Error(`Form with ID '${formId}' not found in model`);
        }

        // Collect all setting keys and logic names from the form
        const { settingKeys } = model.collectSettingKeysFromConfig(formConfig.settings);
        return settingKeys;
    }, [model, formId]);

    const valuesRes = useClientSettings({
        clientTrpc,
        settingKeys,
        staleTime: 0,
        refetchOnMount: 'always',
    });

    const formValuesKey = useMemo(() => {
        return JSON.stringify(valuesRes.data ?? {});
    }, [valuesRes.data]);

    const submitHandler = async (values: Record<string, any>) => {
        await model.executeFormLogicCallbacks(formId, values);

        await clientTrpc.updateSettingsForm.fetch({
            settingKeys,
            values,
        });
    };

    if (valuesRes.isPending) {
        // if (true) {
        return <SkeletonComponent />;
    }

    return (
        <SettingFormComponent
            key={`${formId}:${formValuesKey}:${valuesRes.error ? 'with-error' : 'ok'}`}
            {...props}
            model={model}
            formId={formId}
            defaultValues={valuesRes.data ?? {}}
            onSubmit={submitHandler}
        />
    );
}
