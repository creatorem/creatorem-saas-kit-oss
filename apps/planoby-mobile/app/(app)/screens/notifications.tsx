import { Header } from '@kit/native-ui/layout/header';
import { NotificationList } from '@kit/notification/native/ui/notification-list';
import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function NotificationsScreen() {
    const { t } = useTranslation('notification');
    const { clientTrpc } = useCtxTrpc();

    return (
        <>
            <Header showBackButton title={t('title')} />
            <View className="bg-background flex-1">
                <NotificationList clientTrpc={clientTrpc} />
            </View>
        </>
    );
}
