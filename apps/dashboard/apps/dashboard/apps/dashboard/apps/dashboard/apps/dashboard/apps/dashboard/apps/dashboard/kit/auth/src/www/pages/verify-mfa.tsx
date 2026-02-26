import { Database } from '@kit/db';
import { isMFARequired } from '@kit/supabase';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { SupabaseClient } from '@supabase/supabase-js';
import type { i18n } from 'i18next';
import { redirect } from 'next/navigation';
import { MfaForm } from '../../www/ui/mfa-form';
import { AuthPageProps } from './with-auth-config';

interface Props extends AuthPageProps {
    getServerI18n: () => Promise<i18n>;
    searchParams: Promise<{
        next?: string;
    }>;
}

export const VerifyMfaPage = async ({ getServerI18n, authConfig, ...props }: Props) => {
    const client = getSupabaseServerClient();
    const { language } = await getServerI18n();

    const {
        data: { user },
    } = await client.auth.getUser();

    if (!user) {
        redirect(authConfig.urls.signIn.replace('[lang]', language));
    }

    const needsMfa = await isMFARequired(client as unknown as SupabaseClient<Database>);

    // authConfig.
    if (!needsMfa) {
        if (authConfig.environment !== 'www') {
            throw new Error('Web env required in this file.')
        }
        redirect(authConfig.urls.signIn);
    }

    const nextPath = (await props.searchParams).next;
    const redirectPath = nextPath ?? authConfig.urls.dashboard.replace('[lang]', language);

    return (
        <MfaForm
            userId={user.id}
            paths={{
                redirectPath,
            }}
        />
    );
};
