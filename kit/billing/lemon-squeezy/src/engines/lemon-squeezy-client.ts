import 'server-only';

import { envs } from '@kit/lemon-squeezy/envs';
import { logger } from '@kit/utils';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

/**
 * @description Initialize the Lemon Squeezy client
 */
export async function initializeLemonSqueezyClient() {
    lemonSqueezySetup({
        apiKey: envs().LEMON_SQUEEZY_SECRET_KEY,
        onError(error) {
            logger.error(
                {
                    name: `billing.lemon-squeezy`,
                    error: error.message,
                },
                'Encountered an error using the Lemon Squeezy SDK',
            );
        },
    });
}
