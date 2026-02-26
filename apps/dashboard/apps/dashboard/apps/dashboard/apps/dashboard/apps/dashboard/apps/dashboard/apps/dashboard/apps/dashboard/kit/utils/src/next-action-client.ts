import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { ForbiddenError, GatewayError, NotFoundError, PreConditionError, ValidationError } from './errors';
import { logger } from './logger';

/**
 * Base action client for Next.js server actions
 *
 * This is the foundation action client that provides error handling and metadata schema definition.
 * It can be extended with additional proxy for specific use cases (authentication, CAPTCHA, etc.).
 *
 * Usage:
 * ```typescript
 * const myAction = actionClient
 *   .metadata({ actionName: 'myAction' })
 *   .schema(mySchema)
 *   .action(async ({ parsedInput }) => {
 *     // Your action logic here
 *   });
 * ```
 */
export const actionClient = createSafeActionClient({
    handleServerError(e) {
        if (
            e instanceof ValidationError ||
            e instanceof ForbiddenError ||
            e instanceof NotFoundError ||
            e instanceof PreConditionError ||
            e instanceof GatewayError
        ) {
            return e.message;
        }

        logger.error(e, 'Internal server error in your next-safe-action client');

        return 'Internal server error in your next-safe-action client.';
    },
    defineMetadataSchema() {
        return z.object({
            actionName: z.string(),
        });
    },
});
