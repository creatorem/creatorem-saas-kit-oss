import { Button } from '@kit/native-ui/button';
import { Badge } from '@kit/native-ui/badge';
import { Section } from '@kit/native-ui/layout/section';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { clientTrpc } from '~/utils/trpc-client';

type ConnectState = {
    accountId: string | null;
    status: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
};

const DEFAULT_CONNECT_STATE: ConnectState = {
    accountId: null,
    status: 'not_connected',
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    restricted: 'secondary',
    pending_onboarding: 'outline',
    not_connected: 'destructive',
};

export function StripeConnectSetting() {
    const { t } = useTranslation('settings');
    const { organization } = useOrganization();
    const [isPending, startTransition] = useTransition();
    const [connectState, setConnectState] = useState<ConnectState>(DEFAULT_CONNECT_STATE);

    const organizationId = organization?.id;

    const effectiveStatus = useMemo(() => connectState.status ?? 'not_connected', [connectState.status]);

    const readConnectStatus = useCallback(async () => {
        if (!organizationId) return;
        const response = await (await clientTrpc.paymentConnectGetStatus.fetch({ orgId: organizationId }));
        setConnectState({
            accountId: response.data.connectAccountId,
            status: response.data.connectStatus,
            chargesEnabled: Boolean(response.data.chargesEnabled),
            payoutsEnabled: Boolean(response.data.payoutsEnabled),
            detailsSubmitted: Boolean(response.data.detailsSubmitted),
        });
    }, [organizationId]);

    useEffect(() => {
        if (!organizationId) {
            setConnectState(DEFAULT_CONNECT_STATE);
            return;
        }

        void readConnectStatus().catch(() => {
            setConnectState(DEFAULT_CONNECT_STATE);
        });
    }, [organizationId, readConnectStatus]);

    const handleConnect = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                const settingsUrl = ExpoLinking.createURL('/screens/settings/payments/checkout');
                const response = await (await clientTrpc.paymentConnectCreateOnboardingLink.fetch({
                    orgId: organizationId,
                    returnUrl: settingsUrl,
                    refreshUrl: settingsUrl,
                }));

                await Linking.openURL(response.data.url);
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.connect.errors.createLink');
                toast.error(message);
            }
        });
    };

    const handleSync = () => {
        if (!organizationId) return;

        startTransition(async () => {
            try {
                const response = await (await clientTrpc.paymentConnectSyncAccount.fetch({ orgId: organizationId }));
                setConnectState({
                    accountId: response.data.accountId,
                    status: response.data.status,
                    chargesEnabled: Boolean(response.data.chargesEnabled),
                    payoutsEnabled: Boolean(response.data.payoutsEnabled),
                    detailsSubmitted: Boolean(response.data.detailsSubmitted),
                });
                toast.success(t('company.payment.connect.messages.syncSuccess'));
            } catch (error) {
                const message = error instanceof Error ? error.message : t('company.payment.connect.errors.sync');
                toast.error(message);
            }
        });
    };

    const connectLabel =
        effectiveStatus === 'not_connected'
            ? t('company.payment.connect.actions.connect')
            : t('company.payment.connect.actions.reconnect');

    return (
        <View className="gap-3">
            <Section
                titleSize="lg"
                className="p-0"
                title={t('company.payment.connect.title')}
                subtitle={t('company.payment.connect.description')}
            />

            <View className="flex-row flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[effectiveStatus] ?? 'secondary'}>
                    <Text>
                        {t(`company.payment.connect.status.${effectiveStatus}` as never, {
                            defaultValue: effectiveStatus,
                        } as never)}
                    </Text>
                </Badge>
                <Badge variant={connectState.chargesEnabled ? 'default' : 'outline'}>
                    <Text>
                        {t(
                            connectState.chargesEnabled
                                ? 'company.payment.connect.capabilities.chargesEnabled'
                                : 'company.payment.connect.capabilities.chargesDisabled',
                        )}
                    </Text>
                </Badge>
                <Badge variant={connectState.payoutsEnabled ? 'default' : 'outline'}>
                    <Text>
                        {t(
                            connectState.payoutsEnabled
                                ? 'company.payment.connect.capabilities.payoutsEnabled'
                                : 'company.payment.connect.capabilities.payoutsDisabled',
                        )}
                    </Text>
                </Badge>
                <Badge variant={connectState.detailsSubmitted ? 'default' : 'outline'}>
                    <Text>
                        {t(
                            connectState.detailsSubmitted
                                ? 'company.payment.connect.capabilities.detailsSubmitted'
                                : 'company.payment.connect.capabilities.detailsMissing',
                        )}
                    </Text>
                </Badge>
            </View>

            <View className="flex-row flex-wrap gap-2">
                <Button onPress={handleConnect} disabled={isPending || !organizationId}>
                    <Text>{connectLabel}</Text>
                </Button>
                <Button variant="outline" onPress={handleSync} disabled={isPending || !organizationId}>
                    <Text>{t('company.payment.connect.actions.sync')}</Text>
                </Button>
            </View>
        </View>
    );
}
