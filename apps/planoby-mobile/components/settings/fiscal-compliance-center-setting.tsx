import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Badge } from '@kit/native-ui/badge';
import { Button } from '@kit/native-ui/button';
import { Section } from '@kit/native-ui/layout/section';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { clientTrpc } from '~/utils/trpc-client';

type TransmissionStatus = 'pending' | 'submitted' | 'accepted' | 'rejected' | 'retrying' | 'dead_letter';
type TransmissionType = 'einvoice_b2b_fr' | 'ereporting_transaction' | 'ereporting_payment';

type TransmissionRow = {
    id: string;
    transmissionType: TransmissionType;
    status: TransmissionStatus;
    createdAt: string;
    attemptCount: number;
    maxAttempts: number;
    errorMessage: string | null;
};

const STATUS_FILTER_VALUES = ['all', 'pending', 'submitted', 'accepted', 'rejected', 'retrying', 'dead_letter'] as const;
type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

const STATUS_VARIANT: Record<TransmissionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    submitted: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
    retrying: 'outline',
    dead_letter: 'destructive',
};

export function FiscalComplianceCenterSetting() {
    const { t } = useTranslation('settings');
    const { organization } = useOrganization();
    const [isPending, startTransition] = useTransition();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [rows, setRows] = useState<TransmissionRow[]>([]);
    const [lastExportAt, setLastExportAt] = useState<string | null>(null);

    const organizationId = organization?.id;

    const statusFilterLabels = useMemo(
        () =>
            Object.fromEntries(
                STATUS_FILTER_VALUES.map((value) => [
                    value,
                    t(`company.payment.fiscal.compliance.filters.${value}` as never, { defaultValue: value } as never),
                ]),
            ),
        [t],
    );

    const fetchRows = useCallback(async () => {
        if (!organizationId) {
            setRows([]);
            return;
        }

        const response = await (await clientTrpc.fiscalTransmissionList.fetch({
            orgId: organizationId,
            limit: 50,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }));

        setRows(Array.isArray(response.data) ? (response.data as TransmissionRow[]) : []);
    }, [organizationId, statusFilter]);

    useEffect(() => {
        void fetchRows().catch((error) => {
            const message = error instanceof Error ? error.message : t('company.payment.fiscal.compliance.errors.load');
            toast.error(message);
        });
    }, [fetchRows, t]);

    const handleRefresh = () => {
        startTransition(async () => {
            try {
                await fetchRows();
                toast.success(t('company.payment.fiscal.compliance.messages.refreshed'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.fiscal.compliance.errors.load');
                toast.error(message);
            }
        });
    };

    const retryTransmission = (transmissionId: string) => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                await (await clientTrpc.fiscalTransmissionRetry.fetch({ orgId: organizationId, transmissionId }));
                await fetchRows();
                toast.success(t('company.payment.fiscal.compliance.messages.retrySuccess'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.fiscal.compliance.errors.retry');
                toast.error(message);
            }
        });
    };

    const generateExport = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                const result = await (await clientTrpc.fiscalExportGenerate.fetch({
                    orgId: organizationId,
                    format: 'json',
                }));
                setLastExportAt(result.data?.createdAt ?? new Date().toISOString());
                toast.success(t('company.payment.fiscal.compliance.messages.exportReady'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.fiscal.compliance.errors.export');
                toast.error(message);
            }
        });
    };

    if (!organizationId) {
        return null;
    }

    return (
        <View className="gap-3 rounded-lg border border-border p-4">
            <Section
                titleSize="lg"
                className="p-0"
                title={t('company.payment.fiscal.compliance.title')}
                subtitle={t('company.payment.fiscal.compliance.description')}
            />

            <ActionSheetSelect labels={statusFilterLabels} value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <ActionSheetSelectTrigger>
                    <ActionSheetSelectValue />
                </ActionSheetSelectTrigger>
                <ActionSheetSelectContent>
                    {STATUS_FILTER_VALUES.map((value) => (
                        <ActionSheetSelectItem key={value} value={value} />
                    ))}
                </ActionSheetSelectContent>
            </ActionSheetSelect>

            <View className="flex-row flex-wrap gap-2">
                <Button variant="outline" onPress={handleRefresh} disabled={isPending}>
                    <Text>{t('company.payment.fiscal.compliance.actions.refresh')}</Text>
                </Button>
                <Button onPress={generateExport} disabled={isPending}>
                    <Text>{t('company.payment.fiscal.compliance.actions.generateAuditExport')}</Text>
                </Button>
            </View>

            {lastExportAt ? (
                <Text className="text-muted-foreground text-xs">
                    {t('company.payment.fiscal.compliance.lastExportAt', {
                        date: new Date(lastExportAt).toLocaleString(),
                    })}
                </Text>
            ) : null}

            <View className="gap-2">
                {rows.length === 0 ? (
                    <Text className="text-muted-foreground text-sm">{t('company.payment.fiscal.compliance.empty')}</Text>
                ) : (
                    rows.map((row) => {
                        const canRetry = row.status === 'rejected' || row.status === 'retrying' || row.status === 'dead_letter';

                        return (
                            <View key={row.id} className="gap-2 rounded-lg border border-border p-3">
                                <View className="flex-row flex-wrap items-center gap-2">
                                    <Badge variant={STATUS_VARIANT[row.status]}>
                                        <Text>
                                            {t(`company.payment.fiscal.compliance.filters.${row.status}` as never, {
                                                defaultValue: row.status,
                                            } as never)}
                                        </Text>
                                    </Badge>
                                    <Text className="text-xs font-medium">
                                        {t(`company.payment.fiscal.compliance.types.${row.transmissionType}` as never, {
                                            defaultValue: row.transmissionType,
                                        } as never)}
                                    </Text>
                                </View>

                                <Text className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleString()}</Text>
                                <Text className="text-muted-foreground text-xs">
                                    {t('company.payment.fiscal.compliance.attempts', {
                                        value: row.attemptCount,
                                        max: row.maxAttempts,
                                    })}
                                </Text>
                                {row.errorMessage ? <Text className="text-destructive text-xs">{row.errorMessage}</Text> : null}

                                <Button variant="outline" size="sm" onPress={() => retryTransmission(row.id)} disabled={isPending || !canRetry}>
                                    <Text>{t('company.payment.fiscal.compliance.actions.retry')}</Text>
                                </Button>
                            </View>
                        );
                    })
                )}
            </View>
        </View>
    );
}
