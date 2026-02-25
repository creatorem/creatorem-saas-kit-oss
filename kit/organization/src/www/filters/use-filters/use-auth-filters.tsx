'use client';

import { isBrowser } from '@kit/utils';
// import { dashboardRoutes } from '@kit/utils/config';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useSearchParams } from 'next/navigation';

/**
 * Enqueue all filters that need useOrganization to work.
 */
export function useAuthFilters() {
    const searchParams = useSearchParams();

    const ADD_INVITE_TOKEN_TO_AUTH_NEXT_PATH_CALLBACK = 'addInviteTokenToAuthNextPathCallback';
    const addInviteTokenToAuthNextPathCallback: FilterCallback<'auth_on_sign_in_redirect_url'> = (redirectUrl) => {
        const inviteToken = searchParams.get('invite_token');
        if (inviteToken) {
            // return `${dashboardRoutes.paths.invitations}?${searchParams.toString()}`;
            return `to implement`;
        }

        return redirectUrl;
    };

    useEnqueueFilter('auth_on_sign_in_redirect_url', {
        name: ADD_INVITE_TOKEN_TO_AUTH_NEXT_PATH_CALLBACK,
        fn: addInviteTokenToAuthNextPathCallback,
    });

    const ADD_INVITE_TOKEN_TO_REDIRECT_URL_ON_SIGN_UP = 'addInviteTokenToRedirectUrlOnSignUp';
    const addInviteTokenToRedirectUrlOnSignUp: FilterCallback<'auth_on_sign_up_redirect_url'> = (redirectPath) => {
        if (!isBrowser()) {
            return '';
        }

        const origin = window.location.origin;
        const url = new URL(redirectPath, origin);

        const inviteToken = searchParams.get('invite_token');
        if (inviteToken) {
            url.searchParams.set('invite_token', inviteToken);
        }

        return url.href;
    };

    useEnqueueFilter('auth_on_sign_up_redirect_url', {
        name: ADD_INVITE_TOKEN_TO_REDIRECT_URL_ON_SIGN_UP,
        fn: addInviteTokenToRedirectUrlOnSignUp,
    });
}
