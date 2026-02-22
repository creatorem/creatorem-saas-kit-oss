'use client';

import { AuthProvider as UIAuthProvider } from '@kit/auth/www/ui/auth-provider';
import { applyFilter } from '@kit/utils/filters';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { authConfig } from '~/config/auth.config';

export function AuthProvider(props: React.PropsWithChildren) {
    const dispatchEvent = useDispatchFilterFromAuthEvent();

    const onEvent = useCallback(
        (event: AuthChangeEvent, session: Session | null) => {
            dispatchEvent(event, session?.user.id, {
                email: session?.user.email ?? '',
            });
        },
        [dispatchEvent],
    );

    return (
        <UIAuthProvider authConfig={authConfig} onEvent={onEvent}>
            {props.children}
        </UIAuthProvider>
    );
}

function useDispatchFilterFromAuthEvent() {
    return useCallback((type: AuthChangeEvent, userId: string | undefined, traits: Record<string, string> = {}) => {
        switch (type) {
            case 'INITIAL_SESSION':
            case 'SIGNED_IN':
                if (userId) {
                    applyFilter('user_signed_in', null, { userId, traits });
                }

                break;

            case 'USER_UPDATED':
                applyFilter('user_updated', null, { userId: userId! });

                break;
        }
    }, []);
}
