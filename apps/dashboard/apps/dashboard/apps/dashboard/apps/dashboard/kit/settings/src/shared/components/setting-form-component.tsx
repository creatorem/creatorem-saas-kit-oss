'use client';

import { QuickFormComponentProps, SettingsInputsBase } from '@kit/utils/quick-form';
import { useMemo } from 'react';
import { SettingModel } from '../../shared/setting-model';

export type FormWrapperComponent = React.FC<{
    header?: React.ReactNode;
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
        // Convert settings to QuickForm compatible format
        const convertSettings = (settings: any[]): any[] => {
            return settings.map((setting) => {
                if (setting.type === 'form') {
                    // Convert form to wrapper for QuickForm compatibility
                    return {
                        type: 'wrapper',
                        className: setting.className,
                        header: setting.header,
                        settings: convertSettings(setting.settings || []),
                    };
                } else if (setting.type === 'wrapper' && Array.isArray(setting.settings)) {
                    return {
                        ...setting,
                        settings: convertSettings(setting.settings),
                    };
                }
                return setting;
            });
        };

        const schema = model.getFormSchemaById(formId);

        return {
            id: formConfig.id || 'settings-form',
            title: formConfig.header ? undefined : 'Settings', // Don't set title if header is provided
            className: formConfig.className,
            schema: schema,
            settings: convertSettings(formConfig.settings),
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
        <FormWrapper header={formConfig.header}>
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
