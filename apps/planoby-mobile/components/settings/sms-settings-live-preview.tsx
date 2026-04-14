import { Card, CardContent, CardHeader, CardTitle } from '@kit/native-ui/card';
import { Text } from '@kit/native-ui/text';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { normalizeString } from './utils';

export function SmsSettingsLivePreview() {
    const { t } = useTranslation('settings');
    const { control } = useFormContext<Record<string, unknown>>();
    const values = useWatch({ control }) as Record<string, unknown> | undefined;

    const header = normalizeString(values?.sms_header, '');
    const content = normalizeString(values?.sms_content, '');
    const footer = normalizeString(values?.sms_footer, '');

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>{t('company.notifications.sms.preview.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="border-border gap-2 rounded-xl border p-3">
                    {header ? <Text className="text-sm font-semibold">{header}</Text> : null}
                    <Text className="text-sm">{content || t('company.notifications.sms.smsMessage.placeholder')}</Text>
                    {footer ? <Text className="text-muted-foreground text-xs">{footer}</Text> : null}
                </View>
            </CardContent>
        </Card>
    );
}
