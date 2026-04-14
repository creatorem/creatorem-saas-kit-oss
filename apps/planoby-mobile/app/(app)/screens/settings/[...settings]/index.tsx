import { Header } from '@kit/native-ui/layout/header';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { SettingsPages } from '@kit/settings/native/ui';
import { SettingsSchema } from '@kit/settings/schema-config';
import { CurrentSettingsProvider, useCurrentSettings } from '@kit/settings/shared';
import { parseUISettingConfig } from '@kit/settings/ui-config';
import { settingsSchemas } from '@planoby/shared/config/settings.schema.config';
import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import { SettingsInputsBase, SettingWrapperComponent } from '@kit/utils/quick-form';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { EXTRA_INPUTS } from '~/config/settings.ui.config';
import { useSettingsUiConfig } from '~/hooks/use-settings-ui-config';

export default function SettingsPage() {
    const { settings } = useLocalSearchParams<{
        settings: string[];
    }>();

    return <SettingsPagesFromParams params={settings} />;
}

const Wrapper: SettingWrapperComponent = ({ className, header, children }) => {
    return (
        <View className={cn('flex gap-4 px-4 py-4', className)}>
            {header && <View className="flex gap-2">{header}</View>}
            {children}
        </View>
    );
};

const InternalSettingsPagesFromParams = ({
    params,
    ...props
}: {
    params: string[];
    settingsUI: ReturnType<typeof parseUISettingConfig>;
    inputs: SettingsInputsBase;
    settingsSchemas: SettingsSchema;
}) => {
    const { clientTrpc } = useCtxTrpc();
    const { config } = useCurrentSettings();

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="fadeIn" duration={350} playOnlyOnce={false}>
                <Header
                    showBackButton
                    leftComponent={
                        config ? (
                            <View className="relative z-50 flex-row items-center gap-2 py-4">
                                <Text className="text-foreground text-xl font-bold">{config.title}</Text>
                            </View>
                        ) : undefined
                    }
                />
                <ThemedScroller className="px-2">
                    <SettingsPages clientTrpc={clientTrpc} Wrapper={Wrapper} params={{ settings: params }} {...props} />
                </ThemedScroller>
            </AnimatedView>
        </View>
    );
};

export const SettingsPagesFromParams = ({ params }: { params: string[] }) => {
    const settingsUiConfig = useSettingsUiConfig();

    const filteredSettingsSchema = useApplyFilter('get_settings_schema', settingsSchemas) as typeof settingsSchemas;

    const extraInputs = useApplyFilter('get_settings_extra_inputs', EXTRA_INPUTS);

    return (
        <CurrentSettingsProvider>
            <InternalSettingsPagesFromParams
                params={params}
                settingsUI={settingsUiConfig}
                inputs={extraInputs}
                settingsSchemas={filteredSettingsSchema}
            />
        </CurrentSettingsProvider>
    );
};
