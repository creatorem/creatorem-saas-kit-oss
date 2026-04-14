import { Card, CardContent, CardHeader, CardTitle } from '@kit/native-ui/card';
import { Text } from '@kit/native-ui/text';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { normalizeString } from './utils';

export function InvoiceSettingsLivePreview() {
    const { t } = useTranslation('settings');
    const { control } = useFormContext<Record<string, unknown>>();
    const values = useWatch({ control }) as Record<string, unknown> | undefined;

    const prefix = normalizeString(values?.invoice_prefix, 'INV');
    const legalName = normalizeString(values?.invoice_legal_name, '');
    const address = normalizeString(values?.invoice_address_line1, '');
    const city = normalizeString(values?.invoice_city, '');
    const country = normalizeString(values?.invoice_country, '');
    const footer = normalizeString(values?.invoice_footer, '');

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>{t('company.payment.invoicing.preview.title')}</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
                <View className="border-border rounded-lg border p-3">
                    <Text className="text-sm font-semibold">{`${prefix}-2026-0001`}</Text>
                    <Text className="mt-2 text-sm font-medium">{legalName || t('company.payment.invoicing.fields.legalName.label')}</Text>
                    {address ? <Text className="text-muted-foreground text-xs">{address}</Text> : null}
                    {city || country ? <Text className="text-muted-foreground text-xs">{`${city} ${country}`.trim()}</Text> : null}
                    {footer ? <Text className="text-muted-foreground mt-3 text-xs">{footer}</Text> : null}
                </View>
            </CardContent>
        </Card>
    );
}
