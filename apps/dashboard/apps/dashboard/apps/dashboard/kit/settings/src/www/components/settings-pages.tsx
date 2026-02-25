import { QuickForm } from '@kit/ui/quick-form';
import { Skeleton } from '@kit/ui/skeleton';
import { FormWrapperComponent } from '../../shared/components/setting-form-component';
import { type SettingsPagesProps, SettingsPages as SharedSettingsPages } from '../../shared/components/settings-pages';
import { REGISTERED_SETTINGS_INPUTS } from './registered-settings-inputs';

const FormWrapper: FormWrapperComponent = ({ header, children }) => {
    return (
        <div className="space-y-4 px-4 py-8 sm:px-8">
            {header && <div className="space-y-2">{header}</div>}
            {children}
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
        />
    );
}
