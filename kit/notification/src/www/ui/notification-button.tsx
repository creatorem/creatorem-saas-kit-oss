'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Notification, NotificationTypeEnum } from '@kit/drizzle';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon, type IconName } from '@kit/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { ScrollArea } from '@kit/ui/scroll-area';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import { formatTimeDifference } from '@kit/utils/www';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'motion/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notificationRouter } from '../../router/router';

const SIZE = 20;

const getNotificationStyle = (type: NotificationTypeEnum | null) => {
    switch (type) {
        case 'success':
            return {
                icon: 'CircleCheck' as IconName,
                bgColor: 'bg-green-100 dark:bg-green-950',
                textColor: 'text-green-600 dark:text-green-400',
            };
        case 'warning':
            return {
                icon: 'TriangleAlert' as IconName,
                bgColor: 'bg-yellow-100 dark:bg-yellow-950',
                textColor: 'text-yellow-600 dark:text-yellow-400',
            };
        case 'error':
            return {
                icon: 'CircleX' as IconName,
                bgColor: 'bg-red-100 dark:bg-red-950',
                textColor: 'text-red-600 dark:text-red-400',
            };
        default:
            return {
                icon: 'Info' as IconName,
                bgColor: '',
                textColor: '',
            };
    }
};

export const NotificationButton: React.FC<{
    clientTrpc: TrpcClientWithQuery<typeof notificationRouter>;
}> = ({ clientTrpc }) => {
    const [isOpen, setIsOpen] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(observerRef, { margin: '100px' });
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

    // Load more when scrolling to bottom
    useEffect(() => {
        if (isInView && notificationRes.hasNextPage && !notificationRes.isFetchingNextPage) {
            notificationRes.fetchNextPage();
        }
    }, [isInView, notificationRes]);

    const allNotifications = useMemo(() => {
        return notificationRes.data?.pages.flatMap((page) => page.notifications) ?? [];
    }, [notificationRes.data]);

    const unreadCount = useMemo(() => {
        return allNotifications.filter((n) => !n.read).length;
    }, [allNotifications]);

    const markAsReadMultiple = useCallback(
        async (notificationIds: string[]) => {
            if (notificationIds.length === 0) return;

            await clientTrpc.setAsReadNotifications.fetch({
                markAsRead: notificationIds.map((id) => ({ notificationId: id })),
            });
            // Invalidate query to refresh the list
            notificationRes.refetch();
        },
        [clientTrpc, notificationRes],
    );

    // Track notification as viewed (not read yet)
    const handleNotificationView = useCallback((notification: Notification) => {
        if (!notification.read) {
            viewedNotificationsRef.current.add(notification.id);
        }
    }, []);

    // Handle popover close - mark as read all viewed notifications
    const handleOpenChange = useCallback(
        async (open: boolean) => {
            if (!open && viewedNotificationsRef.current.size > 0) {
                // Mark as read all viewed notifications when closing
                const viewedIds = Array.from(viewedNotificationsRef.current);
                await markAsReadMultiple(viewedIds);
                // Clear the viewed set
                viewedNotificationsRef.current.clear();
            }
            setIsOpen(open);
        },
        [markAsReadMultiple],
    );

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button size="icon" variant={'outline'} aria-label="See notifications" className="relative">
                    <Icon name="Bell" className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <div className="border-background absolute top-2 right-2 size-2.5 rounded-full border bg-red-500"></div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent closeIcon={false} className="w-96 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
                    {/* <Link href="/">
                        <Button aria-label='Notification settings' variant={'outline'} size="icon">
                            <Icon name="Settings" />
                        </Button>
                        </Link> */}
                </div>

                <ScrollArea className="h-[400px]">
                    {notificationRes.isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Icon name="Loader" className="h-6 w-6 animate-spin" />
                        </div>
                    ) : allNotifications.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="Box" className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>No notifications</EmptyTitle>
                                <EmptyDescription>Your next notifications gonna appears here.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="divide-y">
                            {allNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onView={handleNotificationView}
                                />
                            ))}

                            {/* Observer element for infinite scroll */}
                            <div ref={observerRef} className="h-4">
                                {notificationRes.isFetchingNextPage && (
                                    <div className="flex items-center justify-center py-4">
                                        <Icon name="Loader" className="h-5 w-5 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

const NotificationItem: React.FC<{
    notification: Notification;
    onView: (notification: Notification) => void;
}> = ({ notification, onView }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(itemRef, { once: true, margin: '0px' });

    useEffect(() => {
        if (isInView && !notification.read) {
            // Mark as viewed after a short delay when the notification comes into view
            const timer = setTimeout(() => {
                onView(notification);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, notification, onView]);

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

    return (
        <div
            ref={itemRef}
            className={cn(
                'hover:bg-accent/50 cursor-pointer p-4 transition-colors',
                !notification.read && 'bg-accent/20',
            )}
        >
            <div className="flex items-start gap-3">
                <Avatar className="size-9 rounded-full">
                    <AvatarImage src={notification.imageUrl ?? undefined} alt={notification.title ?? undefined} />
                    <AvatarFallback className={cn('size-9 rounded-full', notificationStyle.bgColor)}>
                        <Icon name={iconName} className={cn('size-5', notificationStyle.textColor)} />
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    {notification.title && <h4 className="mb-1 truncate text-sm font-medium">{notification.title}</h4>}
                    <p className="text-muted-foreground line-clamp-2 text-sm">{notification.body}</p>
                    <p className="text-muted-foreground mt-2 text-xs">{formatTimeDifference(notification.createdAt)}</p>
                </div>
                <div
                    className={cn(
                        'mt-2 h-2 w-2 flex-shrink-0 rounded-full',
                        !notification.read ? 'bg-blue-500' : 'bg-transparent',
                    )}
                />
            </div>
        </div>
    );
};
