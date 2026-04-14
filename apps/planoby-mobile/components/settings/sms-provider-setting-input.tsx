import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Input } from '@kit/native-ui/input';
import { Text } from '@kit/native-ui/text';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { unwrapSettingValue } from './utils';

type SmsProviderService = 'bird' | 'gatewayapi';

type SmsProviderValue =
    | null
    | {
          service: 'bird';
          auth: {
              workspaceId: string;
              channelId: string;
              accessKey: string;
          };
      }
    | {
          service: 'gatewayapi';
          auth: {
              token: string;
          };
      };

const defaultProvider = (service: SmsProviderService): Exclude<SmsProviderValue, null> => {
    if (service === 'gatewayapi') {
        return {
            service,
            auth: {
                token: '',
            },
        };
    }

    return {
        service,
        auth: {
            workspaceId: '',
            channelId: '',
            accessKey: '',
        },
    };
};

const toSmsProviderValue = (value: unknown): SmsProviderValue => {
    const parsed = unwrapSettingValue(value);

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    const raw = parsed as Partial<Exclude<SmsProviderValue, null>>;

    if (raw.service === 'bird') {
        const auth = raw.auth as Record<string, unknown> | undefined;
        return {
            service: 'bird',
            auth: {
                workspaceId: typeof auth?.workspaceId === 'string' ? auth.workspaceId : '',
                channelId: typeof auth?.channelId === 'string' ? auth.channelId : '',
                accessKey: typeof auth?.accessKey === 'string' ? auth.accessKey : '',
            },
        };
    }

    if (raw.service === 'gatewayapi') {
        const auth = raw.auth as Record<string, unknown> | undefined;
        return {
            service: 'gatewayapi',
            auth: {
                token: typeof auth?.token === 'string' ? auth.token : '',
            },
        };
    }

    return null;
};

export const SmsProviderSettingInput: QuickFormInput = ({ field, slug }) => {
    const { t } = useTranslation('settings');
    const value = toSmsProviderValue(field.value);
    const provider = value?.service ?? 'bird';

    const labels = useMemo(
        () => ({
            bird: t('company.notifications.sms.providerOptions.bird'),
            gatewayapi: t('company.notifications.sms.providerOptions.gatewayapi'),
        }),
        [t],
    );

    const onProviderChange = (nextProvider: string) => {
        if (nextProvider !== 'bird' && nextProvider !== 'gatewayapi') return;

        if (value?.service === nextProvider) {
            field.onChange(value);
            return;
        }

        field.onChange(defaultProvider(nextProvider));
    };

    const onBirdChange = (key: 'workspaceId' | 'channelId' | 'accessKey') => (text: string) => {
        const current = value?.service === 'bird' ? value : defaultProvider('bird');

        field.onChange({
            service: 'bird',
            auth: {
                ...current.auth,
                [key]: text,
            },
        });
    };

    const onGatewayChange = (text: string) => {
        field.onChange({
            service: 'gatewayapi',
            auth: {
                token: text,
            },
        });
    };

    return (
        <View className="gap-3">
            <ActionSheetSelect labels={labels} value={provider} onValueChange={onProviderChange}>
                <ActionSheetSelectTrigger id={slug}>
                    <ActionSheetSelectValue />
                </ActionSheetSelectTrigger>
                <ActionSheetSelectContent>
                    <ActionSheetSelectItem value="bird" />
                    <ActionSheetSelectItem value="gatewayapi" />
                </ActionSheetSelectContent>
            </ActionSheetSelect>

            {provider === 'bird' ? (
                <View className="border-border gap-3 rounded-xl border p-3">
                    <View>
                        <Text className="text-muted-foreground mb-1 text-sm">
                            {t('company.notifications.sms.workspaceId')}
                        </Text>
                        <Input
                            value={value?.service === 'bird' ? value.auth.workspaceId : ''}
                            onChangeText={onBirdChange('workspaceId')}
                            editable={!field.disabled}
                        />
                    </View>
                    <View>
                        <Text className="text-muted-foreground mb-1 text-sm">
                            {t('company.notifications.sms.channelId')}
                        </Text>
                        <Input
                            value={value?.service === 'bird' ? value.auth.channelId : ''}
                            onChangeText={onBirdChange('channelId')}
                            editable={!field.disabled}
                        />
                    </View>
                    <View>
                        <Text className="text-muted-foreground mb-1 text-sm">
                            {t('company.notifications.sms.accessKey')}
                        </Text>
                        <Input
                            value={value?.service === 'bird' ? value.auth.accessKey : ''}
                            onChangeText={onBirdChange('accessKey')}
                            editable={!field.disabled}
                            secureTextEntry
                        />
                    </View>
                </View>
            ) : null}

            {provider === 'gatewayapi' ? (
                <View className="border-border rounded-xl border p-3">
                    <Text className="text-muted-foreground mb-1 text-sm">{t('company.notifications.sms.token')}</Text>
                    <Input
                        value={value?.service === 'gatewayapi' ? value.auth.token : ''}
                        onChangeText={onGatewayChange}
                        editable={!field.disabled}
                        secureTextEntry
                    />
                </View>
            ) : null}
        </View>
    );
};
