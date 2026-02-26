import { Database } from '@kit/db';
import type { SupabaseClient } from '@supabase/supabase-js';

const ASSURANCE_LEVEL_2 = 'aal2';

export async function isMFARequired(client: SupabaseClient<Database>) {
    // To get rid of getUser() see: https://github.com/supabase/auth-js/issues/873
    // @ts-expect-error: suppressGetSessionWarning is not part of the public API
    client.auth.suppressGetSessionWarning = true;

    const assuranceLevel = await client.auth.mfa.getAuthenticatorAssuranceLevel();

    // @ts-expect-error: suppressGetSessionWarning is not part of the public API
    client.auth.suppressGetSessionWarning = false;

    if (assuranceLevel.error) {
        throw new Error(assuranceLevel.error.message);
    }

    const { nextLevel, currentLevel } = assuranceLevel.data;

    // checks if the next assurance level is AAL2 and that the current one is not AAL2
    return nextLevel === ASSURANCE_LEVEL_2 && nextLevel !== currentLevel;
}
