import { Database } from '@kit/db';
import { I18N_HEADER_NAME } from '@kit/i18n/shared/constants';
import { isMFARequired } from '@kit/supabase';
import { getSupabaseEdgeClient } from '@kit/supabase-server';
import { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import type { AuthConfig } from '../../config';
import { updateSessionDetails } from './session';
import { matchUrlPattern } from './url-pattern-matcher';

export const authProxy = (authConfig: AuthConfig) => async (request: NextRequest, response: NextResponse): Promise<NextResponse | null> => {
    if (authConfig.environment !== 'www') {
        throw new Error('`AuthProvider` is a web only hook');
    }

    const patternHandlers = [
        {
            pattern: authConfig.scopePatterns.auth,
            handler: mfaHandler,
        },
        {
            pattern: authConfig.scopePatterns.private,
            handler: loginRedirecterHandler,
        },
        {
            pattern: authConfig.scopePatterns.private,
            handler: sessionDetailsHandler,
        },
    ];

    const handlePattern = matchUrlPattern(request.nextUrl.pathname, patternHandlers);

    if (handlePattern) {
        const patternHandlerResponse = await handlePattern(request, response, authConfig);

        if (patternHandlerResponse) {
            return patternHandlerResponse;
        }
    }

    return null;
};

const getUser = async (request: NextRequest, response: NextResponse) => {
    const supabase = getSupabaseEdgeClient(request, response);
    const t = await supabase.auth.getUser();
    return t;
};

const mfaHandler = async (req: NextRequest, res: NextResponse, authConfig: AuthConfig) => {
    const {
        data: { user },
    } = await getUser(req, res);

    if (!user) {
        return;
    }

    const lang = res.headers.get(I18N_HEADER_NAME);
    const needsMfaVerification = req.nextUrl.pathname === authConfig.urls.verifyMfa.replace('[lang]', lang ?? '[lang]');

    if (!needsMfaVerification) {
        const nextPath =
            req.nextUrl.searchParams.get('next') ?? authConfig.urls.dashboard.replace('[lang]', lang ?? '[lang]');

        return NextResponse.redirect(new URL(nextPath, req.nextUrl.origin).href);
    }
};

const loginRedirecterHandler = async (req: NextRequest, res: NextResponse, authConfig: AuthConfig) => {
    const {
        data: { user },
    } = await getUser(req, res);

    const origin = req.nextUrl.origin;
    const next = req.nextUrl.pathname;
    const lang = res.headers.get(I18N_HEADER_NAME);

    if (!user) {
        const redirectPath = `${authConfig.urls.signIn}?next=${next}`.replace('[lang]', lang ?? '[lang]');

        return NextResponse.redirect(new URL(redirectPath, origin).href);
    }

    const supabase = getSupabaseEdgeClient(req, res);

    const requiresMultiFactorAuthentication = await isMFARequired(supabase as unknown as SupabaseClient<Database>);

    if (requiresMultiFactorAuthentication) {
        return NextResponse.redirect(
            new URL(authConfig.urls.verifyMfa.replace('[lang]', lang ?? '[lang]'), origin).href,
        );
    }
};

const sessionDetailsHandler = async (req: NextRequest, res: NextResponse) => {
    const supabase = getSupabaseEdgeClient(req, res);

    await updateSessionDetails(supabase as unknown as SupabaseClient<Database>, req, {
        updateUserAgent: true,
        updateIpAddress: true,
    });

    return undefined;
};
