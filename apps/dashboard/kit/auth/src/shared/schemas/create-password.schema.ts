import { TFunction } from 'i18next';
import { z } from 'zod';
import type { AuthConfig } from '../../config';

const DEFAULT_PASSWORD_REQUIREMENTS = {
    minLength: 8,
    maxLength: 99,
    specialChars: false,
    numbers: false,
    uppercase: false,
};

/**
 * Apply min and max length requirements to the password.
 * For already existing users only.
 */
function createPasswordTrimSchema(authConfig: AuthConfig) {
    const requirements = {
        ...DEFAULT_PASSWORD_REQUIREMENTS,
        ...authConfig.passwordRequirements,
    };
    return z.string().min(requirements.minLength).max(requirements.maxLength);
}

export function createPasswordSignInSchema(authConfig: AuthConfig) {
    const passwordSchema = createPasswordTrimSchema(authConfig);

    return z.object({
        email: z.string().email(),
        password: passwordSchema,
    });
}

/**
 * Check all password requirements.
 */
export function createRefinedPasswordSchema(authConfig: AuthConfig, t: TFunction<'p_auth'>) {
    const passwordSchema = createPasswordTrimSchema(authConfig);
    return passwordSchema.superRefine((val, ctx) => validatePassword(val, ctx, authConfig, t));
}

/**
 * Check if the password and repeat password match.
 */
function refinePasswordRepeatMatch(
    data: { password: string; repeatPassword: string },
    ctx: z.RefinementCtx,
    t: TFunction<'p_auth'>,
) {
    if (data.password !== data.repeatPassword) {
        ctx.addIssue({
            message: t('errors.passwordsDoNotMatch'),
            path: ['repeatPassword'],
            code: 'custom',
        });
    }

    return true;
}

/**
 * Used in the sign up froms
 */
export function createPasswordSignUpSchema(authConfig: AuthConfig, t: TFunction<'p_auth'>) {
    const refinedPasswordSchema = createRefinedPasswordSchema(authConfig, t);

    return z
        .object({
            email: z.string().email(),
            password: refinedPasswordSchema,
            repeatPassword: refinedPasswordSchema,
        })
        .superRefine((val, ctx) => refinePasswordRepeatMatch(val, ctx, t));
}

/**
 * Used for the reset password froms
 */
export function createPasswordResetSchema(authConfig: AuthConfig, t: TFunction<'p_auth'>) {
    const refinedPasswordSchema = createRefinedPasswordSchema(authConfig, t);

    return z
        .object({
            password: refinedPasswordSchema,
            repeatPassword: refinedPasswordSchema,
        })
        .superRefine((val, ctx) => refinePasswordRepeatMatch(val, ctx, t));
}

function countOccurrences(password: string, regex: RegExp): number {
    return password.match(regex)?.length ?? 0;
}

function validateSpecialCharacters(password: string, ctx: z.RefinementCtx, t: TFunction<'p_auth'>): void {
    const specialCharsRegex = /[!$#?@%^&*(){}<>[\].:",|`~_]/g;
    const specialCharsCount = countOccurrences(password, specialCharsRegex);

    if (specialCharsCount < 1) {
        ctx.addIssue({
            message: t('errors.minPasswordSpecialChars'),
            code: 'custom',
        });
    }
}

function validateNumbers(password: string, ctx: z.RefinementCtx, t: TFunction<'p_auth'>): void {
    const numbersRegex = /\d/g;
    const numbersCount = countOccurrences(password, numbersRegex);

    if (numbersCount < 1) {
        ctx.addIssue({
            message: t('errors.minPasswordNumbers'),
            code: 'custom',
        });
    }
}

function validateUppercase(password: string, ctx: z.RefinementCtx, t: TFunction<'p_auth'>): void {
    const uppercaseRegex = /[A-Z]/;

    if (!uppercaseRegex.test(password)) {
        ctx.addIssue({
            message: t('errors.uppercasePassword'),
            code: 'custom',
        });
    }
}

function validatePassword(password: string, ctx: z.RefinementCtx, authConfig: AuthConfig, t: TFunction<'p_auth'>) {
    const requirements = {
        ...DEFAULT_PASSWORD_REQUIREMENTS,
        ...(authConfig.passwordRequirements || {}),
    };

    if (requirements.specialChars) {
        validateSpecialCharacters(password, ctx, t);
    }

    if (requirements.numbers) {
        validateNumbers(password, ctx, t);
    }

    if (requirements.uppercase) {
        validateUppercase(password, ctx, t);
    }

    return true;
}
