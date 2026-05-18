'use client';

import { QuickFormComponentProps, SettingsInputsBase } from '@kit/utils/quick-form';
import { useMemo } from 'react';
import { SettingModel } from '../../shared/setting-model';

export type FormWrapperComponent = React.FC<{
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
}>;

export interface SettingFormComponentProps {
    model: SettingModel<Record<string, any>, SettingsInputsBase>;
    defaultValues: Record<string, any>;
    formId: string;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    inputs: SettingsInputsBase;
    QuickForm: React.FC<QuickFormComponentProps>;
    FormWrapper: FormWrapperComponent;
}

// type SettingInputRendererProps = BaseInputProps & {
//     type: string;
//     [key: string]: any; // Allow any additional props that will be passed to the input component
// };

type AnySettingConfig = {
    type?: string;
    className?: string;
    wrapperType?: 'plain' | 'section';
    settings?: AnySettingConfig[];
    [key: string]: any;
};

const convertSettings = (settings: AnySettingConfig[]): AnySettingConfig[] => {
    return settings.map((setting) => {
        if (setting.type === 'form') {
            return {
                type: 'wrapper',
                wrapperType: 'plain',
                className: setting.className,
                header: setting.header,
                footer: setting.footer,
                settings: convertSettings(setting.settings || []),
            } as AnySettingConfig;
        }

        if (setting.type === 'wrapper' && Array.isArray(setting.settings)) {
            return {
                ...setting,
                wrapperType: setting.wrapperType ?? 'plain',
                settings: convertSettings(setting.settings),
            } satisfies AnySettingConfig;
        }

        return setting;
    });
};

export function SettingFormComponent({
    model,
    QuickForm,
    defaultValues,
    formId,
    onSubmit,
    inputs,
    FormWrapper,
}: SettingFormComponentProps) {
    const formConfig = useMemo(() => {
        const formConfig = model.findFormConfigById(formId);

        if (!formConfig) {
            throw new Error(`Form with ID '${formId}' not found in model`);
        }

        return formConfig;
    }, [model]);

    // Convert the serialized schema to a format QuickForm can understand
    const quickFormConfig = useMemo(() => {
        const schema = model.getFormSchemaById(formId);

        return {
            id: formConfig.id || 'settings-form',
            title: undefined,
            className: formConfig.className,
            schema: schema,
            settings: convertSettings(formConfig.settings as AnySettingConfig[]) as any,
            submitButton: formConfig.submitButton || {
                text: 'Save Changes',
                className: 'bg-green-600 hover:bg-green-700',
            },
        };
    }, [formConfig, model]);

    // function SettingInputRenderer({ ...props }: SettingInputRendererProps) {
    //     return <QuickFormInputRenderer {...props} inputs={inputs} />;
    // }

    return (
        <FormWrapper header={formConfig.header} footer={formConfig.footer}>
            <QuickForm
                config={quickFormConfig}
                defaultValues={defaultValues}
                onSubmit={onSubmit}
                inputs={inputs}
                // inputRenderer={SettingInputRenderer}
            />
        </FormWrapper>
    );
}
