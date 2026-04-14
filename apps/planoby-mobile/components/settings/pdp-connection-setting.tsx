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
import { Linking, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { clientTrpc } from '~/utils/trpc-client';

type ConnectionState = {
    id: string;
    providerSlug: string;
    status: 'not_connected' | 'connecting' | 'connected' | 'error';
    accountId: string | null;
    externalReference: string | null;
    lastError: string | null;
    lastSyncedAt: string | null;
    metadata: Record<string, unknown>;
};

const DEFAULT_CONNECTION_STATE: ConnectionState = {
    id: '',
    providerSlug: 'manual',
    status: 'not_connected',
    accountId: null,
    externalReference: null,
    lastError: null,
    lastSyncedAt: null,
    metadata: {},
};

const STATUS_VARIANT: Record<ConnectionState['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    connected: 'default',
    connecting: 'outline',
    error: 'destructive',
    not_connected: 'secondary',
};

const PROVIDERS = ['manual', 'pennylane'] as const;

const normalizeProvider = (value: string | null | undefined): string => {
    if (value === 'manual' || value === 'pennylane') {
        return value;
    }

    return 'manual';
};

export function PdpConnectionSetting() {
    const { t } = useTranslation('settings');
    const { organization } = useOrganization();
    const [isPending, startTransition] = useTransition();
    const [state, setState] = useState<ConnectionState>(DEFAULT_CONNECTION_STATE);
    const [provider, setProvider] = useState<string>('manual');

    const organizationId = organization?.id;

    const labels = useMemo(
        () => ({
            manual: t('company.payment.fiscal.pdp.providers.manual'),
            pennylane: t('company.payment.fiscal.pdp.providers.pennylane'),
        }),
        [t],
    );

    const refresh = useCallback(async () => {
        if (!organizationId) return;

        const response = await (await clientTrpc.pdpConnectionGetStatus.fetch({ orgId: organizationId }));
        const next = response.data;

        setState({
            id: next.id,
            providerSlug: normalizeProvider(next.providerSlug),
            status: next.status,
            accountId: next.accountId,
            externalReference: next.externalReference ?? null,
            lastError: next.lastError,
            lastSyncedAt: next.lastSyncedAt,
            metadata:
                next.metadata && typeof next.metadata === 'object' && !Array.isArray(next.metadata)
                    ? (next.metadata as Record<string, unknown>)
                    : {},
        });
        setProvider(normalizeProvider(next.providerSlug));
    }, [organizationId]);

    useEffect(() => {
        if (!organizationId) {
            setState(DEFAULT_CONNECTION_STATE);
            setProvider('manual');
            return;
        }

        void refresh().catch(() => {
            setState(DEFAULT_CONNECTION_STATE);
            setProvider('manual');
        });
    }, [organizationId, refresh]);

    const handleConnect = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                const started = await (await clientTrpc.pdpConnectionStart.fetch({
                    orgId: organizationId,
                    provider,
                    returnUrl: ExpoLinking.createURL('/screens/settings/payments/checkout'),
                }));

                const redirectUrl = started.data.authorizationUrl;
                if (redirectUrl && redirectUrl.startsWith('http')) {
                    await Linking.openURL(redirectUrl);
                    return;
                }

                if (provider === 'pennylane') {
                    throw new Error(t('company.payment.fiscal.pdp.messages.oauthUrlMissing'));
                }

                await (await clientTrpc.pdpConnectionFinalize.fetch({
                    orgId: organizationId,
                    provider,
                }));

                await refresh();
                toast.success(t('company.payment.fiscal.pdp.messages.connected'));
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : t('company.payment.fiscal.pdp.messages.connectionFailed');
                toast.error(message);
            }
        });
    };

    const handleSync = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                await (await clientTrpc.pdpConnectionSync.fetch({ orgId: organizationId }));
                await refresh();
                toast.success(t('company.payment.fiscal.pdp.messages.synced'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.fiscal.pdp.messages.syncFailed');
                toast.error(message);
            }
        });
    };

    const handleDisconnect = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                await (await clientTrpc.pdpConnectionDisconnect.fetch({ orgId: organizationId }));
                await refresh();
                toast.success(t('company.payment.fiscal.pdp.messages.disconnected'));
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : t('company.payment.fiscal.pdp.messages.disconnectFailed');
                toast.error(message);
            }
        });
    };

    return (
        <View className="gap-3 rounded-lg border border-border p-4">
            <Section titleSize="lg" className="p-0" title={t('company.payment.fiscal.pdp.title')} subtitle={t('company.payment.fiscal.pdp.description')} />

            <View className="flex-row flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[state.status]}>
                    <Text>
                        {t(`company.payment.fiscal.pdp.status.${state.status}` as never, {
                            defaultValue: state.status,
                        } as never)}
                    </Text>
                </Badge>
                {state.accountId ? (
                    <Text className="text-muted-foreground text-xs">
                        {t('company.payment.fiscal.pdp.accountId')}: {state.accountId}
                    </Text>
                ) : null}
            </View>

            <ActionSheetSelect labels={labels} value={provider} onValueChange={setProvider}>
                <ActionSheetSelectTrigger>
                    <ActionSheetSelectValue />
                </ActionSheetSelectTrigger>
                <ActionSheetSelectContent>
                    {PROVIDERS.map((item) => (
                        <ActionSheetSelectItem key={item} value={item} />
                    ))}
                </ActionSheetSelectContent>
            </ActionSheetSelect>

            {state.lastError ? <Text className="text-destructive text-xs">{state.lastError}</Text> : null}

            <View className="flex-row flex-wrap gap-2">
                <Button onPress={handleConnect} disabled={isPending || !organizationId}>
                    <Text>{t('company.payment.fiscal.pdp.actions.connect')}</Text>
                </Button>
                <Button variant="outline" onPress={handleSync} disabled={isPending || !organizationId}>
                    <Text>{t('company.payment.fiscal.pdp.actions.sync')}</Text>
                </Button>
                <Button variant="ghost" onPress={handleDisconnect} disabled={isPending || !organizationId}>
                    <Text>{t('company.payment.fiscal.pdp.actions.disconnect')}</Text>
                </Button>
            </View>
        </View>
    );
}
