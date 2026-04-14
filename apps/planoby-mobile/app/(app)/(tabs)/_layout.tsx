import { useUser } from '@kit/auth/shared/user';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { useOrganization } from '@kit/organization/shared';
import * as Device from 'expo-device';
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '~/components/avatar';
import { TabButton } from '~/components/tab-button';

const hasOneOf = (permissions: string[], accepted: string[]) => accepted.some((permission) => permissions.includes(permission));
const isIPhoneWithiOS26Plus =
    Platform.OS === 'ios' &&
    Device.deviceType === Device.DeviceType.PHONE &&
    parseInt(Device.osVersion || '0', 10) >= 26;

export default function Layout() {
    const { t } = useTranslation('common');
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { permissions } = useOrganization();
    const user = useUser();
    const profileName = user?.name ?? t('more.member');
    const profileUrl = user?.profileUrl ?? undefined;

    const permissionList = permissions as string[];
    const canViewAgenda = hasOneOf(permissionList, ['slot_admin.select', 'slot.select', 'booking.select']);
    const canViewBookings = hasOneOf(permissionList, ['booking.select']);
    const canViewServices = hasOneOf(permissionList, ['service.select']);

    return isIPhoneWithiOS26Plus ? (
        <NativeTabs
            backBehavior="history"
            minimizeBehavior="onScrollDown"
            backgroundColor={colors['--color-background']}
        >
            {canViewAgenda ? (
                <NativeTabs.Trigger name="agenda" disableScrollToTop>
                    <NativeTabs.Trigger.Label>{t('tabs.agenda')}</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon sf="calendar" />
                </NativeTabs.Trigger>
            ) : null}

            {canViewBookings ? (
                <NativeTabs.Trigger name="bookings" disableScrollToTop>
                    <NativeTabs.Trigger.Label>{t('tabs.bookings')}</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon sf="checklist" />
                </NativeTabs.Trigger>
            ) : null}

            {canViewServices ? (
                <NativeTabs.Trigger name="services" disableScrollToTop>
                    <NativeTabs.Trigger.Label>{t('tabs.services')}</NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon sf="cube" />
                </NativeTabs.Trigger>
            ) : null}

            <NativeTabs.Trigger name="profile" disableScrollToTop>
                <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.circle" />
            </NativeTabs.Trigger>
        </NativeTabs>
    ) : (
        <Tabs>
            <TabSlot />
            <TabList
                style={{
                    backgroundColor: colors['--color-background'],
                    borderTopColor: colors['--color-secondary'],
                    borderTopWidth: 1,
                    paddingBottom: insets.bottom,
                }}
            >
                {canViewAgenda ? (
                    <TabTrigger name="agenda" href="/(app)/(tabs)/agenda" asChild>
                        <TabButton labelAnimated icon="CalendarDays">
                            {t('tabs.agenda')}
                        </TabButton>
                    </TabTrigger>
                ) : null}

                {canViewBookings ? (
                    <TabTrigger name="bookings" href="/(app)/(tabs)/bookings" asChild>
                        <TabButton labelAnimated icon="ClipboardCheck">
                            {t('tabs.bookings')}
                        </TabButton>
                    </TabTrigger>
                ) : null}

                {canViewServices ? (
                    <TabTrigger name="services" href="/(app)/(tabs)/services" asChild>
                        <TabButton labelAnimated icon="Package">
                            {t('tabs.services')}
                        </TabButton>
                    </TabTrigger>
                ) : null}

                <TabTrigger name="profile" href="/(app)/(tabs)/profile" asChild>
                    <TabButton avatar={<Avatar src={profileUrl} size="xxs" name={profileName} />}>
                        {t('tabs.profile')}
                    </TabButton>
                </TabTrigger>
            </TabList>
        </Tabs>
    );
}
