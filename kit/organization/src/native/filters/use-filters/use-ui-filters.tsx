'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Header } from '@kit/native-ui/layout/header';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { Unmatched } from 'expo-router';
import { View } from 'react-native';
import { organizationRouter } from '../../../router/router';
import { OrganizationList, OrganizationSwitcher, UserInvitationsPage } from '../../components';

const DISPLAY_SMALL_ORGANIZATION_SWITCHER = 'displaySmallOrganizationSwitcher';
const displaySmallOrganizationSwitcher: FilterCallback<'display_sidebar_logo_name'> = () => (
    <>
        <OrganizationSwitcher smallLogo />
    </>
);

const DISPLAY_ORGANIZATION_SWITCHER = 'displayOrganizationSwitcher';
const displayOrganizationSwitcher: FilterCallback<'display_after_profile_image'> = () => (
    <>
        <OrganizationSwitcher />
    </>
);

const ADD_ORGANIZATION_SCREENS = 'addOrganizationScreens';
const addOrganizationScreens: FilterCallback<'display_extra_screens'> = (s, { clientTrpc, path }) => {
    switch (path) {
        case 'all-organizations':
            return (
                <>
                    <Header showBackButton title="Organizations" />
                    <View className="bg-background flex-1">
                        <ThemedScroller>
                            <OrganizationList
                                clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>}
                            />
                            <UserInvitationsPage
                                clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>}
                            />
                        </ThemedScroller>
                    </View>
                </>
            );
    }

    return <Unmatched />;
};

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useUiFilters() {
    useEnqueueFilter('display_sidebar_logo_name', {
        name: DISPLAY_SMALL_ORGANIZATION_SWITCHER,
        fn: displaySmallOrganizationSwitcher,
    });
    useEnqueueFilter('display_after_profile_image', {
        name: DISPLAY_ORGANIZATION_SWITCHER,
        fn: displayOrganizationSwitcher,
    });
    useEnqueueFilter('display_extra_screens', { name: ADD_ORGANIZATION_SCREENS, fn: addOrganizationScreens });
}
