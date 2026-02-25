import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Notification, NotificationTypeEnum } from '@kit/drizzle';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/native-ui/avatar';
import { Icon, type IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import { formatTimeDifference } from '@kit/utils/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Pressable, RefreshControl, View } from 'react-native';
import { notificationRouter } from '../../router/router';

const SIZE = 20;

const getNotificationStyle = (type: NotificationTypeEnum | null) => {
    switch (type) {
        case 'success':
            return {
                icon: 'CheckCircle' as IconName,
                bgColor: 'bg-green-100 dark:bg-green-950',
                textColor: 'text-green-600 dark:text-green-400',
            };
        case 'warning':
            return {
                icon: 'AlertCircle' as IconName,
                bgColor: 'bg-yellow-100 dark:bg-yellow-950',
                textColor: 'text-yellow-600 dark:text-yellow-400',
            };
        case 'error':
            return {
                icon: 'X' as IconName,
                bgColor: 'bg-red-100 dark:bg-red-950',
                textColor: 'text-red-600 dark:text-red-400',
            };
        default:
            return {
                icon: 'BadgeInfo' as IconName,
                bgColor: 'bg-blue-100 dark:bg-blue-950',
                textColor: 'text-blue-600 dark:text-blue-400',
            };
    }
};

export const NotificationList: React.FC<{
    clientTrpc: TrpcClientWithQuery<typeof notificationRouter>;
    onNotificationPress?: (notification: Notification) => void;
}> = ({ clientTrpc, onNotificationPress }) => {
    const viewedNotificationsRef = useRef<Set<string>>(new Set());
    const notificationResQueryKey = useApplyFilter('notification_get_notification_query_key', [
        'get-notifications-infinite',
    ]);

    const notificationRes = useInfiniteQuery({
        queryKey: notificationResQueryKey,
        queryFn: async ({ pageParam: { page } }) => {
            const res = await clientTrpc.getNotifications.fetch({
                page,
                pageSize: SIZE,
            });
            return { ...res, nextPage: page + 1 };
        },
        initialPageParam: { page: 1 },
        getNextPageParam: (lastRes) => {
            if ((lastRes.nextPage - 1) * SIZE >= lastRes.totalCount) {
                return null;
            }
            return {
                page: lastRes.nextPage,
            };
        },
    });

    const allNotifications = useMemo(() => {
        return notificationRes.data?.pages.flatMap((page) => page.notifications) ?? [];
    }, [notificationRes.data]);

    const markAsReadMultiple = useCallback(
        async (notificationIds: string[]) => {
            if (notificationIds.length === 0) return;

            await clientTrpc.setAsReadNotifications.fetch({
                markAsRead: notificationIds.map((id) => ({ notificationId: id })),
            });
            notificationRes.refetch();
        },
        [clientTrpc, notificationRes],
    );

    const handleNotificationView = useCallback((notification: Notification) => {
        if (!notification.read) {
            viewedNotificationsRef.current.add(notification.id);
        }
    }, []);

    const handleLoadMore = useCallback(() => {
        if (notificationRes.hasNextPage && !notificationRes.isFetchingNextPage) {
            notificationRes.fetchNextPage();
        }
    }, [notificationRes]);

    // Mark viewed notifications as read on unmount
    useEffect(() => {
        return () => {
            const viewedIds = Array.from(viewedNotificationsRef.current);
            if (viewedIds.length > 0) {
                markAsReadMultiple(viewedIds);
            }
        };
    }, [markAsReadMultiple]);

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<Notification>) => (
            <NotificationItem notification={item} onView={handleNotificationView} onPress={onNotificationPress} />
        ),
        [handleNotificationView, onNotificationPress],
    );

    const renderEmpty = useCallback(() => {
        if (notificationRes.isLoading) {
            return (
                <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator size="large" />
                </View>
            );
        }
        return (
            <View className="flex-1 items-center justify-center px-6 py-20">
                <Icon name="Box" size={48} className="mb-4 opacity-50" />
                <Text variant="h4" className="mb-2 text-center">
                    No notifications
                </Text>
                <Text variant="muted" className="text-center">
                    Your next notifications will appear here.
                </Text>
            </View>
        );
    }, [notificationRes.isLoading]);

    const keyExtractor = useCallback((item: Notification) => item.id, []);

    return (
        <FlatList
            data={allNotifications}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={notificationRes.isFetchingNextPage} />}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={allNotifications.length === 0 ? { flexGrow: 1 } : undefined}
        />
    );
};

const NotificationItem: React.FC<{
    notification: Notification;
    onView: (notification: Notification) => void;
    onPress?: (notification: Notification) => void;
}> = ({ notification, onView, onPress }) => {
    const hasViewed = useRef(false);

    useEffect(() => {
        if (!hasViewed.current && !notification.read) {
            const timer = setTimeout(() => {
                onView(notification);
                hasViewed.current = true;
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [notification, onView]);

    const notificationStyle = useMemo(
        () => getNotificationStyle(notification.type as NotificationTypeEnum | null),
        [notification.type],
    );

    const iconName = useMemo(() => {
        if (notification.icon) {
            return notification.icon as IconName;
        }
        return notificationStyle.icon;
    }, [notification.icon, notificationStyle.icon]);

    const handlePress = useCallback(() => {
        onPress?.(notification);
    }, [notification, onPress]);

    return (
        <Pressable
            onPress={handlePress}
            className={cn(
                'border-border active:bg-accent/50 flex-row items-start gap-3 border-b p-4',
                !notification.read && 'bg-accent/20',
            )}
        >
            <Avatar alt={notification.title} className="size-9">
                {notification.imageUrl ? <AvatarImage source={{ uri: notification.imageUrl }} /> : null}
                <AvatarFallback className={cn('size-9', notificationStyle.bgColor)}>
                    <Icon name={iconName} size={20} className={notificationStyle.textColor} />
                </AvatarFallback>
            </Avatar>

            <View className="flex-1 gap-1">
                {notification.title && (
                    <Text variant="small" className="font-medium">
                        {notification.title}
                    </Text>
                )}
                <Text variant="muted" className="text-sm" numberOfLines={2}>
                    {notification.body}
                </Text>
                <Text variant="muted" className="mt-1 text-xs">
                    {formatTimeDifference(notification.createdAt)}
                </Text>
            </View>

            <View
                className={cn('my-auto h-2 w-2 rounded-full', !notification.read ? 'bg-blue-500' : 'bg-transparent')}
            />
        </Pressable>
    );
};
