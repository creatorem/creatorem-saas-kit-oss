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

type EmailProviderValue =
    | null
    | {
          service: 'planoby' | 'gmail';
          auth: {
              user: string;
              pass: string;
          };
      };

const toEmailProviderValue = (value: unknown): EmailProviderValue => {
    const parsed = unwrapSettingValue(value);

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    const raw = parsed as Partial<Exclude<EmailProviderValue, null>>;

    if (raw.service !== 'gmail' && raw.service !== 'planoby') {
        return null;
    }

    const auth = raw.auth ?? { user: '', pass: '' };

    return {
        service: raw.service,
        auth: {
            user: typeof auth.user === 'string' ? auth.user : '',
            pass: typeof auth.pass === 'string' ? auth.pass : '',
        },
    };
};

export const EmailProviderSettingInput: QuickFormInput = ({ field, slug }) => {
    const { t } = useTranslation('settings');
    const value = toEmailProviderValue(field.value);
    const provider = value?.service === 'gmail' ? 'gmail' : 'planoby';

    const labels = useMemo(
        () => ({
            planoby: t('company.notifications.email.providerOptions.default'),
            gmail: t('company.notifications.email.providerOptions.gmail'),
        }),
        [t],
    );

    const onProviderChange = (nextProvider: string) => {
        if (nextProvider === 'planoby') {
            field.onChange(null);
            return;
        }

        field.onChange({
            service: 'gmail',
            auth: {
                user: value?.service === 'gmail' ? value.auth.user : '',
                pass: value?.service === 'gmail' ? value.auth.pass : '',
            },
        });
    };

    const onAuthChange = (key: 'user' | 'pass') => (text: string) => {
        field.onChange({
            service: 'gmail',
            auth: {
                user: key === 'user' ? text : value?.service === 'gmail' ? value.auth.user : '',
                pass: key === 'pass' ? text : value?.service === 'gmail' ? value.auth.pass : '',
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
                    <ActionSheetSelectItem value="planoby" />
                    <ActionSheetSelectItem value="gmail" />
                </ActionSheetSelectContent>
            </ActionSheetSelect>

            {provider === 'gmail' ? (
                <View className="border-border gap-3 rounded-xl border p-3">
                    <View>
                        <Text className="text-muted-foreground mb-1 text-sm">
                            {t('company.notifications.email.gmailEmail')}
                        </Text>
                        <Input
                            value={value?.service === 'gmail' ? value.auth.user : ''}
                            onChangeText={onAuthChange('user')}
                            editable={!field.disabled}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View>
                        <Text className="text-muted-foreground mb-1 text-sm">
                            {t('company.notifications.email.gmailPassword')}
                        </Text>
                        <Input
                            value={value?.service === 'gmail' ? value.auth.pass : ''}
                            onChangeText={onAuthChange('pass')}
                            editable={!field.disabled}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            ) : null}
        </View>
    );
};
