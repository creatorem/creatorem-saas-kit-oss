import { useUser } from '@kit/auth/shared/user';
import { Header, HeaderIcon } from '@kit/native-ui/layout/header';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { useOrganization } from '@kit/organization/shared';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { Avatar } from '~/components/avatar';
import ListLink from '~/components/list-link';
import ThemeToggle from '~/components/theme-toggle';

const hasOneOf = (permissions: string[], accepted: string[]) => accepted.some((permission) => permissions.includes(permission));

export default function ProfileScreen() {
    const { t } = useTranslation('common');
    const { permissions } = useOrganization();
    const user = useUser();

    const displayName = user?.name ?? t('more.member');
    const userEmail = user?.email ?? '';
    const profileUrl = user?.profileUrl ?? undefined;

    const permissionList = permissions as string[];

    const canSeeAnalytics = hasOneOf(permissionList, ['booking.select', 'service.select']);
    const canSeeMailbox = hasOneOf(permissionList, ['booking.select']);
    const canSeeDiscounts = hasOneOf(permissionList, ['service.select']);

    return (
        <View className="bg-background flex-1">
            <Header
                leftComponent={<ThemeToggle />}
                rightComponents={[<HeaderIcon key="settings-button" icon="Settings" href="/screens/settings-menu" />]}
            />

            <ThemedScroller>
                <AnimatedView animation="scaleIn">
                    <View className="mb-8 mt-2 flex-col items-center justify-center">
                        <Avatar src={profileUrl} size="xxl" name={displayName} />
                        <View className="mt-4 flex-1 items-center justify-center px-4">
                            <Text className="text-3xl font-bold">{displayName}</Text>
                            {userEmail ? <Text className="text-muted-foreground mt-1 text-base">{userEmail}</Text> : null}
                        </View>
                    </View>

                    <View className="gap-1 px-4">
                        {canSeeAnalytics ? (
                            <ListLink
                                showChevron
                                title={t('analytics.title')}
                                description={t('analytics.subtitle')}
                                icon="ChartNoAxesCombined"
                                href="/screens/analytics"
                            />
                        ) : null}

                        {canSeeMailbox ? (
                            <ListLink
                                showChevron
                                title={t('mailbox.title')}
                                description={t('mailbox.subtitle')}
                                icon="Mail"
                                href="/screens/mailbox"
                            />
                        ) : null}

                        {canSeeDiscounts ? (
                            <ListLink
                                showChevron
                                title={t('discounts.title')}
                                description={t('discounts.subtitle')}
                                icon="Tag"
                                href="/screens/discounts"
                            />
                        ) : null}

                        <ListLink
                            showChevron
                            title={t('notifications.title')}
                            description={t('notifications.subtitle')}
                            icon="Bell"
                            href="/screens/notifications"
                        />
                    </View>
                </AnimatedView>
            </ThemedScroller>
        </View>
    );
}
