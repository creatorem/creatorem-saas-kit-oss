import { Button } from '@kit/native-ui/button';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { clientTrpc } from '~/utils/trpc-client';

type GoogleCalendarStatus = Awaited<ReturnType<typeof clientTrpc.googleCalendarStatus.fetch>>;

export function GoogleCalendarSyncSetting() {
    const { t } = useTranslation('settings');
    const { organization } = useOrganization();
    const organizationId = organization?.id;

    const statusQuery = useQuery({
        queryKey: ['google-calendar-status', organizationId],
        enabled: Boolean(organizationId),
        queryFn: async (): Promise<GoogleCalendarStatus> => {
            const response = await clientTrpc.googleCalendarStatus.fetch({
                orgId: organizationId!,
            });
            return await response;
        },
    });

    const connected = Boolean(statusQuery.data?.connected);
    const reconnectRequired = Boolean(statusQuery.data?.reconnectRequired);

    return (
        <View className="gap-3 rounded-lg border border-border p-4">
            <Text className="text-base font-semibold">{t('company.integrations.google.title')}</Text>
            <Text className="text-muted-foreground text-sm">
                {t('company.integrations.google.description')}
            </Text>

            <Text className="text-sm">
                {statusQuery.isPending
                    ? t('common.loading')
                    : connected
                      ? reconnectRequired
                        ? t('company.integrations.google.reconnectRequired')
                        : t('company.integrations.google.connected')
                      : t('company.integrations.google.notConnected')}
            </Text>

            {statusQuery.data?.googleEmail ? (
                <Text className="text-muted-foreground text-xs">{statusQuery.data.googleEmail}</Text>
            ) : null}

            <View className="flex-row gap-2">
                <Button
                    className="flex-1"
                    variant="outline"
                    disabled={!organizationId || statusQuery.isFetching}
                    onPress={async () => {
                        if (!organizationId) return;
                        await clientTrpc.googleCalendarSyncNow.fetch({ orgId: organizationId });
                        await statusQuery.refetch();
                    }}
                >
                    <Text>{t('company.integrations.google.syncNow')}</Text>
                </Button>

                <Button
                    className="flex-1"
                    disabled={!organizationId || statusQuery.isFetching}
                    onPress={async () => {
                        if (!organizationId) return;
                        if (connected) {
                            await clientTrpc.googleCalendarDisconnect.fetch({ orgId: organizationId });
                        }
                        await statusQuery.refetch();
                    }}
                >
                    <Text>
                        {connected ? t('company.integrations.google.disconnect') : t('company.integrations.google.connect')}
                    </Text>
                </Button>
            </View>
        </View>
    );
}
