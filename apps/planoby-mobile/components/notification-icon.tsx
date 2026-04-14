import { HeaderIcon } from '@kit/native-ui/layout/header';
import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';

export default function NotificationIcon() {
    const { clientTrpc } = useCtxTrpc();

    const hasNotificationsRes = clientTrpc.hasUnreadNotifications.useQuery();

    return <HeaderIcon hasBadge={hasNotificationsRes.data?.hasUnread} icon="Bell" href="/screens/notifications" />;
}
