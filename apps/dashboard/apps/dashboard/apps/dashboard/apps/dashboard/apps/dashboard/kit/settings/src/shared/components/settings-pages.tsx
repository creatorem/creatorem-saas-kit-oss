'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { SettingsInputsBase, SettingWrapperComponent } from '@kit/utils/quick-form';
import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SettingsSchema } from '../../config/parse-schema-config';
import type { parseUISettingConfig } from '../../config/parse-ui-config';
// import type { getSettingsValuesAction, getSettingsValuesSchema } from '../../router/get-settings-values';
import type { getSettingsRouter } from '../../router/router';
import {
    isFormConfig,
    isLogicInputConfig,
    isQuickFormInputConfig,
    isQuickFormUIComponent,
    isQuickFormWrapperConfig,
    SettingModel,
} from '../../shared/setting-model';
import { isGroupConfig, isPageConfig, PageConfig, UIConfig } from '../../shared/type';
import { SettingFormComponent, type SettingFormComponentProps } from './setting-form-component';

export interface SettingsPagesProps extends Pick<SettingFormComponentProps, 'inputs' | 'QuickForm' | 'FormWrapper'> {
    params: {
        settings: string[];
    };
    onNotFound?: () => void;
    Wrapper: SettingWrapperComponent;
    clientTrpc: TrpcClientWithQuery<ReturnType<typeof getSettingsRouter>>;
    SkeletonComponent: React.FC;
    settingsSchemas: SettingsSchema;
    settingsUI: ReturnType<typeof parseUISettingConfig>;
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
    setConfig: () => {},
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
    const existingContext = useContext(CurrentSettings);

    // Render the settings page if we have a valid page config
    if (currentConfig && isPageConfig(currentConfig)) {
        const children = <SettingsPageRenderer {...props} model={model} pageConfig={currentConfig} />;

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
        'Wrapper' | 'clientTrpc' | 'inputs' | 'QuickForm' | 'FormWrapper' | 'SkeletonComponent'
    > {
    pageConfig: PageConfig<Record<string, any>, SettingsInputsBase>;
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
}

function SettingsPageRenderer({ pageConfig, ...props }: SettingsPageRendererProps) {
    const { setConfig } = useCurrentSettings();

    useEffect(() => {
        setConfig(pageConfig);
    }, [setConfig]);

    return <>{pageConfig.settings.map((setting, index) => renderSetting({ setting, index, ...props }))}</>;
}

// Helper function to render individual settings
function renderSetting({
    setting,
    index,
    Wrapper,
    ...props
}: {
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
    setting: any;
    index: number;
} & Pick<
    SettingsPagesProps,
    'Wrapper' | 'clientTrpc' | 'inputs' | 'QuickForm' | 'FormWrapper' | 'SkeletonComponent'
>): React.ReactNode {
    const key = `setting-${index}`;

    // Handle UI components
    if (isQuickFormUIComponent(setting)) {
        return <React.Fragment key={key}>{setting.render}</React.Fragment>;
    }

    // Handle form configurations
    if (isFormConfig(setting)) {
        return (
            <React.Fragment key={key}>
                <SettingsFormInitializer {...props} formId={setting.id} Wrapper={Wrapper} />
            </React.Fragment>
        );
    }

    // Handle wrapper configurations
    if (isQuickFormWrapperConfig(setting)) {
        return (
            <React.Fragment key={key}>
                <Wrapper header={setting.header} className={setting.className}>
                    {setting.settings.map((nestedSetting, nestedIndex) =>
                        renderSetting({
                            setting: nestedSetting,
                            index: nestedIndex,
                            Wrapper,
                            ...props,
                        }),
                    )}
                </Wrapper>
            </React.Fragment>
        );
    }

    // Handle regular input settings - these need to be wrapped in a form
    if (isQuickFormInputConfig(setting)) {
        console.warn(
            `Setting '${setting.slug}' found outside of form context. ` +
                'Consider wrapping individual settings in a form configuration.',
        );
        return null;
    }

    // Handle confirmation input settings - these also need to be wrapped in a form
    if (isLogicInputConfig(setting)) {
        console.warn(
            `Confirmation input '${setting.name}' found outside of form context. ` +
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

    const valuesRes = useQuery({
        queryKey: [`get-settings-values-${formId}`],
        queryFn: async () => {
            return await clientTrpc.getSettingsValues.fetch({
                settingKeys,
            });
        },
    });

    const submitHandler = async (values: Record<string, any>) => {
        await model.executeFormLogicCallbacks(formId, values);

        await clientTrpc.updateSettingsForm.fetch({
            settingKeys,
            values,
        });
    };

    if (valuesRes.isPending || !valuesRes.data) {
        // if (true) {
        return <SkeletonComponent />;
    }

    return (
        <SettingFormComponent
            {...props}
            model={model}
            formId={formId}
            defaultValues={valuesRes.data}
            onSubmit={submitHandler}
        />
    );
}
