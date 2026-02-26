/**
 * CAPTCHA verification utilities for server-side actions.
 *
 * This module provides Cloudflare Turnstile CAPTCHA verification functionality
 * integrated with Next.js server actions. It includes:
 *
 * - Core verification functions against Cloudflare Turnstile API
 * - Action client proxy for automatic CAPTCHA verification
 * - Authenticated action client with database access
 *
 * The verification process includes proper error handling, logging, and
 * transformation of errors into user-friendly ValidationError instances.
 */

import 'server-only';

import { envs } from '@kit/auth/envs';
import { getDrizzleSupabaseClient } from '@kit/db';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { logger, ValidationError } from '@kit/utils';
import { actionClient } from '@kit/utils/next';

// Cloudflare Turnstile verification endpoint and secret key configuration
const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify' as const;
const CAPTCHA_SECRET_KEY = envs.www().CAPTCHA_SECRET_KEY;

/**
 * Creates the FormData payload required by Cloudflare Turnstile verification API.
 * The API expects 'secret' and 'response' fields as per their documentation.
 */
function createVerificationRequestBody(token: string) {
    if (!CAPTCHA_SECRET_KEY) {
        throw new Error('CAPTCHA_SECRET_KEY is not set');
    }

    const requestBody = new FormData();
    requestBody.append('secret', CAPTCHA_SECRET_KEY);
    requestBody.append('response', token);
    return requestBody;
}

/**
 * Sends the verification request to Cloudflare Turnstile API.
 * Throws an error if the HTTP request fails (non-2xx status codes).
 * The response should be parsed as JSON to check the verification result.
 */
async function sendVerificationRequest(requestBody: FormData) {
    const response = await fetch(VERIFY_ENDPOINT, {
        method: 'POST',
        body: requestBody,
    });

    if (!response.ok) {
        logger.error({ statusText: response.statusText }, 'Captcha verification request failed');
        throw new Error('Failed to verify CAPTCHA token');
    }

    return response;
}

/**
 * Validates the response from Cloudflare Turnstile API.
 * The API returns a JSON object with a 'success' boolean field.
 * Additional fields like 'error-codes' may be present for debugging failed verifications.
 */
function validateVerificationResponse(data: any) {
    if (!data.success) {
        throw new Error('Invalid CAPTCHA token');
    }
}

function isValidClientInput(clientInput: unknown): clientInput is Record<string, unknown> {
    return clientInput !== null && typeof clientInput === 'object';
}

function hasCaptchaToken(clientInput: Record<string, unknown>): boolean {
    return 'captchaToken' in clientInput;
}

function extractCaptchaToken(clientInput: Record<string, unknown>): string | undefined {
    const token = clientInput.captchaToken;
    return typeof token === 'string' ? token : undefined;
}

function isValidCaptchaToken(token: string | undefined): token is string {
    return Boolean(token && token.length > 0);
}

/**
 * Orchestrates CAPTCHA verification with proper error handling and logging.
 * Transforms verification errors into ValidationError for consistent client handling.
 * Logs both successful verifications and failures for monitoring purposes.
 */
async function handleCaptchaVerification(token: string) {
    try {
        await verifyCaptcha(token);
        logger.debug('Captcha verification successful');
    } catch (error) {
        logger.warn({ error }, 'Captcha verification failed');
        throw new ValidationError('Invalid CAPTCHA token');
    }
}

/**
 * Performs complete CAPTCHA verification against Cloudflare Turnstile API.
 * This is the main verification function that orchestrates the entire process:
 * 1. Creates the API request payload
 * 2. Sends the request to Cloudflare
 * 3. Parses and validates the response
 *
 * Throws an error if verification fails at any step.
 */
export async function verifyCaptcha(token: string) {
    const requestBody = createVerificationRequestBody(token);
    const response = await sendVerificationRequest(requestBody);
    const responseData = await response.json();

    validateVerificationResponse(responseData);
}

/**
 * Action client with automatic CAPTCHA verification proxy.
 *
 * This client extends the base actionClient with CAPTCHA verification proxy.
 * Any action using this client will automatically verify CAPTCHA tokens if a 'captchaToken'
 * field is present in the client input. The token is optional - actions work normally
 * without it, but verification occurs automatically when provided.
 *
 * Use this client for public actions that may require CAPTCHA protection.
 *
 * @example
 * ```typescript
 * const myAction = captchaActionClient
 *   .metadata({ actionName: 'myAction' })
 *   .schema(mySchema)
 *   .action(async ({ parsedInput }) => {
 *     // Action logic here - CAPTCHA is already verified if token was provided
 *   });
 * ```
 *
 * @example Client usage:
 * ```typescript
 * const result = await myAction({ data: 'value', captchaToken: captchaTokenFromProvider });
 * ```
 *
 * @throws {ValidationError} When CAPTCHA verification fails, with message 'Invalid CAPTCHA token'
 */
export const captchaActionClient = actionClient.use(async ({ next, clientInput }) => {
    if (isValidClientInput(clientInput) && hasCaptchaToken(clientInput)) {
        const captchaToken = extractCaptchaToken(clientInput);

        if (isValidCaptchaToken(captchaToken)) {
            await handleCaptchaVerification(captchaToken);
        }
    }

    return next();
});

/**
 * Action client that combines CAPTCHA verification with authenticated database access.
 *
 * This client extends captchaActionClient with additional proxy that provides
 * authenticated database access via Supabase and Drizzle. Use this for actions that
 * require both CAPTCHA protection and access to user-specific database resources.
 *
 * The context includes a 'db' property with full database access for the authenticated user.
 * All Row Level Security (RLS) policies will be applied automatically.
 *
 * @example
 * ```typescript
 * const myProtectedAction = authCaptchaActionClient
 *   .metadata({ actionName: 'myProtectedAction' })
 *   .schema(mySchema)
 *   .action(async ({ ctx: { db }, parsedInput }) => {
 *     // Access authenticated user's data
 *     const userData = await db.query.users.findFirst();
 *     return { userData };
 *   });
 * ```
 */
export const authCaptchaActionClient = captchaActionClient.use(async ({ next }) => {
    const supabaseClient = getSupabaseServerClient();
    const db = await getDrizzleSupabaseClient(supabaseClient);

    return next({ ctx: { db } });
});
