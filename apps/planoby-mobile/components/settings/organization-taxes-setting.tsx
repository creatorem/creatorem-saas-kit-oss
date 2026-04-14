import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Button } from '@kit/native-ui/button';
import { Input } from '@kit/native-ui/input';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';
import { clientTrpc } from '~/utils/trpc-client';
import { normalizeBoolean } from './utils';

type TaxMode = 'inclusive' | 'exclusive';

type TaxRow = {
    id: string;
    name: string;
    rate: string | number;
    mode: TaxMode;
    enabled: boolean;
    sortOrder: number;
};

type TaxDraft = {
    name: string;
    rate: string;
    mode: TaxMode;
    enabled: boolean;
};

export function OrganizationTaxesSetting() {
    const { t } = useTranslation('settings');
    const { organization } = useOrganization();
    const { control } = useFormContext<Record<string, unknown>>();
    const formValues = useWatch({ control }) as Record<string, unknown> | undefined;

    const organizationId = organization?.id;
    const [isPending, startTransition] = useTransition();
    const [taxes, setTaxes] = useState<TaxRow[]>([]);
    const [drafts, setDrafts] = useState<Record<string, TaxDraft>>({});
    const [newTaxName, setNewTaxName] = useState('');
    const [newTaxRate, setNewTaxRate] = useState('20');
    const [newTaxMode, setNewTaxMode] = useState<TaxMode>('exclusive');

    const isTaxEnabled = normalizeBoolean(formValues?.tax_enabled) === true;

    const modeLabels = useMemo(
        () => ({
            exclusive: t('company.payment.taxes.mode.exclusive'),
            inclusive: t('company.payment.taxes.mode.inclusive'),
        }),
        [t],
    );

    const syncDrafts = useCallback((rows: TaxRow[]) => {
        const nextDrafts: Record<string, TaxDraft> = {};
        for (const row of rows) {
            nextDrafts[row.id] = {
                name: row.name,
                rate: String(row.rate ?? '0'),
                mode: row.mode,
                enabled: Boolean(row.enabled),
            };
        }

        setDrafts(nextDrafts);
    }, []);

    const fetchTaxes = useCallback(async () => {
        if (!organizationId) return;

        const response = await (await clientTrpc.organizationTaxList.fetch({ orgId: organizationId }));
        const rows = (response.data ?? []) as TaxRow[];
        setTaxes(rows);
        syncDrafts(rows);
    }, [organizationId, syncDrafts]);

    useEffect(() => {
        if (!organizationId || !isTaxEnabled) {
            setTaxes([]);
            setDrafts({});
            return;
        }

        void fetchTaxes().catch((error) => {
            const message = error instanceof Error ? error.message : t('company.payment.taxes.errors.load');
            toast.error(message);
        });
    }, [fetchTaxes, isTaxEnabled, organizationId, t]);

    const sortedTaxes = useMemo(
        () => [...taxes].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
        [taxes],
    );

    const updateDraft = (taxId: string, patch: Partial<TaxDraft>) => {
        setDrafts((previous) => ({
            ...previous,
            [taxId]: {
                ...(previous[taxId] ?? { name: '', rate: '0', mode: 'exclusive', enabled: true }),
                ...patch,
            },
        }));
    };

    const handleSaveTax = (taxId: string) => {
        const draft = drafts[taxId];
        if (!organizationId || !draft) return;

        startTransition(async () => {
            const rate = Number.parseFloat(draft.rate);
            if (!Number.isFinite(rate) || rate < 0) {
                toast.error(t('company.payment.taxes.errors.invalidRate'));
                return;
            }

            try {
                await (
                    await clientTrpc.organizationTaxUpdate.fetch({
                        orgId: organizationId,
                        taxId,
                        name: draft.name.trim(),
                        rate,
                        mode: draft.mode,
                        enabled: draft.enabled,
                    })
                );
                await fetchTaxes();
                toast.success(t('company.payment.taxes.messages.updated'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.taxes.errors.update');
                toast.error(message);
            }
        });
    };

    const handleDeleteTax = (taxId: string) => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                await (await clientTrpc.organizationTaxDelete.fetch({ orgId: organizationId, taxId }));
                await fetchTaxes();
                toast.success(t('company.payment.taxes.messages.deleted'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.taxes.errors.delete');
                toast.error(message);
            }
        });
    };

    const handleCreateTax = () => {
        if (!organizationId) return;

        startTransition(async () => {
            const trimmedName = newTaxName.trim();
            const rate = Number.parseFloat(newTaxRate);

            if (!trimmedName) {
                toast.error(t('company.payment.taxes.errors.nameRequired'));
                return;
            }

            if (!Number.isFinite(rate) || rate < 0) {
                toast.error(t('company.payment.taxes.errors.invalidRate'));
                return;
            }

            try {
                await (
                    await clientTrpc.organizationTaxCreate.fetch({
                        orgId: organizationId,
                        name: trimmedName,
                        rate,
                        mode: newTaxMode,
                        enabled: true,
                        sortOrder: taxes.length,
                    })
                );

                setNewTaxName('');
                setNewTaxRate('20');
                setNewTaxMode('exclusive');
                await fetchTaxes();
                toast.success(t('company.payment.taxes.messages.created'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.taxes.errors.create');
                toast.error(message);
            }
        });
    };

    if (!organizationId || !isTaxEnabled) {
        return null;
    }

    return (
        <View className="gap-3 rounded-lg border border-border p-4">
            <Text className="text-base font-semibold">{t('company.payment.taxes.title')}</Text>
            <Text className="text-muted-foreground text-sm">{t('company.payment.taxes.description')}</Text>

            <View className="gap-3">
                {sortedTaxes.map((row) => {
                    const draft = drafts[row.id] ?? {
                        name: row.name,
                        rate: String(row.rate),
                        mode: row.mode,
                        enabled: row.enabled,
                    };

                    return (
                        <View key={row.id} className="gap-2 rounded-lg border border-border p-3">
                            <Input
                                value={draft.name}
                                onChangeText={(value) => updateDraft(row.id, { name: value })}
                                editable={!isPending}
                                placeholder={t('company.payment.taxes.fields.name')}
                            />
                            <Input
                                value={draft.rate}
                                onChangeText={(value) => updateDraft(row.id, { rate: value })}
                                editable={!isPending}
                                placeholder={t('company.payment.taxes.fields.rate')}
                                keyboardType="decimal-pad"
                            />
                            <ActionSheetSelect
                                labels={modeLabels}
                                value={draft.mode}
                                onValueChange={(value) => updateDraft(row.id, { mode: value as TaxMode })}
                            >
                                <ActionSheetSelectTrigger>
                                    <ActionSheetSelectValue />
                                </ActionSheetSelectTrigger>
                                <ActionSheetSelectContent>
                                    <ActionSheetSelectItem value="exclusive" />
                                    <ActionSheetSelectItem value="inclusive" />
                                </ActionSheetSelectContent>
                            </ActionSheetSelect>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm">{t('company.payment.taxes.fields.enabled')}</Text>
                                <Switch
                                    value={draft.enabled}
                                    onValueChange={(enabled) => updateDraft(row.id, { enabled })}
                                    disabled={isPending}
                                />
                            </View>

                            <View className="flex-row gap-2">
                                <Button className="flex-1" onPress={() => handleSaveTax(row.id)} disabled={isPending}>
                                    <Text>{t('company.payment.taxes.actions.save')}</Text>
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onPress={() => handleDeleteTax(row.id)}
                                    disabled={isPending}
                                >
                                    <Text>{t('company.payment.taxes.actions.delete')}</Text>
                                </Button>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View className="gap-2 rounded-lg border border-dashed border-border p-3">
                <Text className="text-sm font-medium">{t('company.payment.taxes.actions.add')}</Text>
                <Input
                    value={newTaxName}
                    onChangeText={setNewTaxName}
                    placeholder={t('company.payment.taxes.fields.name')}
                    editable={!isPending}
                />
                <Input
                    value={newTaxRate}
                    onChangeText={setNewTaxRate}
                    placeholder={t('company.payment.taxes.fields.rate')}
                    keyboardType="decimal-pad"
                    editable={!isPending}
                />
                <ActionSheetSelect labels={modeLabels} value={newTaxMode} onValueChange={(value) => setNewTaxMode(value as TaxMode)}>
                    <ActionSheetSelectTrigger>
                        <ActionSheetSelectValue />
                    </ActionSheetSelectTrigger>
                    <ActionSheetSelectContent>
                        <ActionSheetSelectItem value="exclusive" />
                        <ActionSheetSelectItem value="inclusive" />
                    </ActionSheetSelectContent>
                </ActionSheetSelect>

                <Button onPress={handleCreateTax} disabled={isPending}>
                    <Text>{t('company.payment.taxes.actions.create')}</Text>
                </Button>
            </View>
        </View>
    );
}
