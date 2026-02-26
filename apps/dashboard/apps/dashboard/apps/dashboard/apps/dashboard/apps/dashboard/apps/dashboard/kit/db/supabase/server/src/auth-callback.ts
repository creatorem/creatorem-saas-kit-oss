import 'server-only';

import { Database } from '@kit/db';
import { logger } from '@kit/utils';
import { applyServerFilter } from '@kit/utils/filters/server';
import type { createServerClient } from '@supabase/ssr';
import { AuthError } from '@supabase/supabase-js';

export class AuthCallbackEngine {
    constructor(private readonly client: ReturnType<typeof createServerClient<Database>>) {}

    async exchangeCodeForSession(
        request: Request,
        params: {
            joinTeamPath?: string;
            redirectPath: string;
            errorPath?: string;
        },
    ): Promise<{
        nextPath: string;
    }> {
        const requestUrl = new URL(request.url);
        const searchParams = requestUrl.searchParams;

        const authCode = searchParams.get(PARAMS.CODE);
        const inputError = searchParams.get(PARAMS.ERROR);
        const nextUrlPathFromParams = searchParams.get(PARAMS.NEXT);
        const errorPath = params.errorPath ?? DEFAULT_ERROR_PATH;

        const nextUrl = applyServerFilter(
            'server_auth_on_sign_in_redirect_url',
            nextUrlPathFromParams ?? params.redirectPath,
            {
                searchParams,
            },
        );

        if (authCode) {
            try {
                const { error } = await this.client.auth.exchangeCodeForSession(authCode);

                if (error) {
                    return onError({
                        code: error.code,
                        error: error.message,
                        path: errorPath,
                    });
                }
            } catch (error) {
                logger.error({ error, name: 'auth.callback' }, 'An error occurred while exchanging code for session');

                const message = error instanceof Error ? error.message : error;

                return onError({
                    code: (error as AuthError)?.code,
                    error: message as string,
                    path: errorPath,
                });
            }
        }

        if (inputError) {
            return onError({
                error: inputError,
                path: errorPath,
            });
        }

        return {
            nextPath: nextUrl,
        };
    }
}

function onError({ error, path, code }: { error: string; path: string; code?: string }) {
    const errorMessage = getAuthErrorMessage({ error, code });

    logger.error({ error, name: 'auth.callback' }, 'An error occurred while signing user in');

    const searchParams = new URLSearchParams({
        [PARAMS.ERROR]: errorMessage,
        [PARAMS.CODE]: code ?? '',
    });

    const nextPath = `${path}?${searchParams.toString()}`;

    return {
        nextPath,
    };
}

/**
 * Error helpers
 */
function isCodeVerifierMismatchError(error: string) {
    return error.includes('both auth code and code verifier should be non-empty');
}

function getAuthErrorMessage(params: { error: string; code?: string }) {
    if (params.code) {
        if (params.code === 'otp_expired') {
            return 'p_auth:errors.otp_expired';
        }
    }

    if (isCodeVerifierMismatchError(params.error)) {
        return 'p_auth:errors.codeVerifierMismatch';
    }

    return `auth:authenticationErrorAlertBody`;
}

// -----------------
// URL/query helpers
// -----------------

const DEFAULT_ERROR_PATH = '/api/auth/callback-error';

const PARAMS = {
    TOKEN_HASH: 'token',
    TYPE: 'type',
    NEXT: 'next',
    CALLBACK: 'redirect_to',
    EMAIL: 'email',
    CODE: 'code',
    ERROR: 'error',
} as const;
