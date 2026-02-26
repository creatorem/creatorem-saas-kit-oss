'use client';

import { useAuthStateChange } from '@kit/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { AuthConfig } from '../../config';

export interface AuthProviderProps extends React.PropsWithChildren {
    authConfig: AuthConfig;
    onEvent?: (event: AuthChangeEvent, session: Session | null) => void;
}

/**
 * Wrapping your app will this component will prevent user to log to your app with different account in the same session.
 *
 * Will automatically redirect all browser user tabs on log out.
 */
export function AuthProvider({ children, authConfig, onEvent }: AuthProviderProps) {
    if (authConfig.environment !== 'www') {
        throw new Error('`AuthProvider` is a web only hook');
    }

    useAuthStateChange({
        scopePatterns: authConfig.scopePatterns,
        onEvent,
    });

    return <>{children}</>;
}
