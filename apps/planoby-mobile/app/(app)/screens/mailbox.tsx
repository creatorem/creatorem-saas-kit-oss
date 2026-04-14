import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { CardScroller } from '~/components/card-scroller';
import { Chip } from '~/components/chip';
import { clientTrpc } from '~/utils/trpc-client';

type Channel = 'email' | 'sms';
const PAGE_SIZE = 40;
type MailboxThreadsResponse = Awaited<ReturnType<typeof clientTrpc.mailboxThreads.fetch>>;
type ThreadMessagesResponse = Awaited<ReturnType<typeof clientTrpc.mailboxThreadMessages.fetch>>;

function MessageBubble({
    direction,
    subject,
    body,
    activityAt,
}: {
    direction: string;
    subject: string | null;
    body: string | null;
    activityAt: string | null;
}) {
    const incoming = direction === 'incoming';

    return (
        <View className={`mb-3 ${incoming ? 'items-start' : 'items-end'}`}>
            <View
                className={`max-w-[90%] rounded-2xl border px-4 py-3 ${
                    incoming ? 'border-border bg-accent/40' : 'border-primary bg-primary/10'
                }`}
            >
                {subject ? <Text className="mb-1 text-sm font-semibold">{subject}</Text> : null}
                {body ? <Text className="text-sm">{body}</Text> : null}
                {activityAt ? <Text className="text-muted-foreground mt-2 text-xs">{activityAt}</Text> : null}
            </View>
        </View>
    );
}

export default function MailboxScreen() {
    const { t } = useTranslation('common');
    const { organization, permissions } = useOrganization();
    const [channel, setChannel] = useState<Channel>('email');
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    const canRead = permissions.includes('booking.select');

    const threadsQuery = useInfiniteQuery({
        queryKey: ['mailbox-threads', organization.id, channel],
        queryFn: async ({ pageParam: { page } }): Promise<MailboxThreadsResponse & { nextPage: number }> => {
            const response = await clientTrpc.mailboxThreads.fetch({
                orgId: organization.id,
                channel,
                page,
                pageSize: PAGE_SIZE,
            });

            return {
                ...(await response),
                nextPage: page + 1,
            };
        },
        initialPageParam: { page: 1 },
        getNextPageParam: (lastPage) => {
            const page = lastPage.meta.pagination.page;
            const pageCount = lastPage.meta.pagination.pageCount;
            return page < pageCount ? { page: lastPage.nextPage } : null;
        },
        enabled: canRead,
    });

    const threadMessagesQuery = useQuery({
        queryKey: ['mailbox-thread-messages', organization.id, selectedThreadId, channel],
        queryFn: async (): Promise<ThreadMessagesResponse> => {
            const response = await clientTrpc.mailboxThreadMessages.fetch({
                orgId: organization.id,
                threadId: selectedThreadId as string,
                channel,
                page: 1,
                pageSize: 100,
            });
            return await response;
        },
        enabled: canRead && selectedThreadId != null,
    });

    const allThreads = useMemo(() => threadsQuery.data?.pages.flatMap((page) => page.data) ?? [], [threadsQuery.data?.pages]);

    if (canRead === false) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('mailbox.title')} />
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="AlertCircle" className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>{t('permissions.noAccess')}</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            </View>
        );
    }

    if (threadsQuery.isPending) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('mailbox.title')} />
                <View className="px-4 pt-4">
                    <Skeleton className="mb-3 h-10 w-full rounded-full" />
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                </View>
            </View>
        );
    }

    const onLoadMoreThreads = useCallback(() => {
        if (threadsQuery.isFetchingNextPage === false && threadsQuery.hasNextPage) {
            threadsQuery.fetchNextPage();
        }
    }, [threadsQuery]);

    if (selectedThreadId != null) {
        const threadMessages = threadMessagesQuery.data?.data ?? [];

        return (
            <View className="bg-background flex-1">
                <AnimatedView animation="scaleIn">
                    <Header
                        showBackButton
                        title={t('mailbox.threadTitle')}
                        onBackPress={() => setSelectedThreadId(null)}
                        rightComponents={[
                            <TouchableOpacity key="close-thread" onPress={() => setSelectedThreadId(null)}>
                                <Icon name="X" size={20} />
                            </TouchableOpacity>,
                        ]}
                    />

                    <View className="px-4 pb-3">
                        <CardScroller className="pt-2" space={5}>
                            <Chip label={t('mailbox.channel.email')} isSelected={channel === 'email'} onPress={() => setChannel('email')} />
                            <Chip label={t('mailbox.channel.sms')} isSelected={channel === 'sms'} onPress={() => setChannel('sms')} />
                        </CardScroller>
                    </View>

                    {threadMessagesQuery.isPending ? (
                        <View className="px-4">
                            <Skeleton className="mb-3 h-16 w-4/5 rounded-2xl" />
                            <Skeleton className="mb-3 ml-auto h-16 w-4/5 rounded-2xl" />
                        </View>
                    ) : (
                        <FlatList
                            data={threadMessages}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <MessageBubble
                                    direction={item.direction}
                                    subject={item.subject}
                                    body={item.bodyText}
                                    activityAt={item.activityAt}
                                />
                            )}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
                        />
                    )}
                </AnimatedView>
            </View>
        );
    }

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="scaleIn">
                <Header showBackButton title={t('mailbox.title')} />

                <View className="px-4 pb-3">
                    <CardScroller className="pt-2" space={5}>
                        <Chip label={t('mailbox.channel.email')} isSelected={channel === 'email'} onPress={() => setChannel('email')} />
                        <Chip label={t('mailbox.channel.sms')} isSelected={channel === 'sms'} onPress={() => setChannel('sms')} />
                    </CardScroller>
                </View>

                {allThreads.length === 0 ? (
                    <Empty className="flex-1">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Icon name="Mail" className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>{t('mailbox.empty')}</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <FlatList
                        data={allThreads}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={threadsQuery.isFetchingNextPage} />}
                        onEndReached={onLoadMoreThreads}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            threadsQuery.isFetchingNextPage ? (
                                <View className="py-4">
                                    <ActivityIndicator size="small" />
                                </View>
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity activeOpacity={0.85} onPress={() => setSelectedThreadId(item.id)}>
                                <View className="dark:bg-card/40 bg-accent/40 border-border mx-4 mb-3 rounded-2xl border p-4">
                                    <View className="mb-1 flex-row items-center justify-between">
                                        <Text className="text-base font-semibold" numberOfLines={1}>
                                            {item.firstname} {item.lastname ?? ''}
                                        </Text>
                                        <Text className="text-muted-foreground text-xs">{item.lastMessageActivityAt ?? ''}</Text>
                                    </View>

                                    <Text className="text-muted-foreground mb-1 text-xs">#{item.bookingRelativeId ?? '-'}</Text>

                                    <Text className="text-sm" numberOfLines={2}>
                                        {item.lastMessagePreview || t('mailbox.noPreview')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                )}
            </AnimatedView>
        </View>
    );
}
