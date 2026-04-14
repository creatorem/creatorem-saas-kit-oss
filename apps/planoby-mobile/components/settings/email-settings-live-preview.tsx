import { Card, CardContent, CardHeader, CardTitle } from '@kit/native-ui/card';
import { Text } from '@kit/native-ui/text';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { normalizeString } from './utils';

export function EmailSettingsLivePreview() {
    const { t } = useTranslation('settings');
    const { control } = useFormContext<Record<string, unknown>>();
    const values = useWatch({ control }) as Record<string, unknown> | undefined;

    const preview = useMemo(
        () => ({
            sender: normalizeString(values?.email_displayed_name, 'Planoby Team'),
            message: normalizeString(values?.email_content, t('company.notifications.email.emailMessage.placeholder')),
            footer: normalizeString(values?.email_template_footer_custom_text, ''),
            theme: normalizeString(values?.email_template_theme, 'default'),
            font: normalizeString(values?.email_template_font, 'outfit'),
        }),
        [t, values],
    );

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>{t('company.notifications.email.preview.title')}</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
                <View className="border-border rounded-lg border p-3">
                    <Text className="text-sm font-semibold">{preview.sender}</Text>
                    <Text className="text-muted-foreground mt-1 text-sm">{preview.message || '-'}</Text>
                    {preview.footer ? <Text className="text-muted-foreground mt-3 text-xs">{preview.footer}</Text> : null}
                </View>
                <Text className="text-muted-foreground text-xs">
                    {t('company.notifications.email.preview.meta', {
                        theme: preview.theme,
                        font: preview.font,
                    })}
                </Text>
            </CardContent>
        </Card>
    );
}
