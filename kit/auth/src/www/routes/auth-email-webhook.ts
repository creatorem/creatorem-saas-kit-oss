import { envs } from '@kit/auth/envs';
import {
    renderConfirmChangeEmailAddressEmail,
    renderConfirmEmailAddressEmail,
    renderInviteUserEmail,
    renderMagicLinkEmail,
    renderResetPasswordEmail,
} from '@kit/email-templates';
import { EmailProvider } from '@kit/emailer';
import { logger } from '@kit/utils';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';

interface AuthHookRequest {
    user: {
        id: string;
        aud: string;
        role: string;
        email: string;
        phone: string;
        app_metadata: {
            provider: string;
            providers: string[];
        };
        user_metadata: {
            email: string;
            email_verified: boolean;
            phone_verified: boolean;
            sub: string;
            name?: string;
            full_name?: string;
            [key: string]: any;
        };
        identities: {
            identity_id: string;
            id: string;
            user_id: string;
            identity_data: {
                email: string;
                email_verified: boolean;
                phone_verified: boolean;
                sub: string;
            };
            provider: string;
            last_sign_in_at: string;
            created_at: string;
            updated_at: string;
            email: string;
        }[];
        created_at: string;
        updated_at: string;
        is_anonymous: boolean;
    };
    email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: 'signup' | 'recovery' | 'magic_link' | 'email_change' | 'invite';
        site_url: string;
        token_new?: string;
        token_hash_new?: string;
        confirmation_url?: string;
    };
}

const htmlToPlainText = (html: string): string =>
    html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim();

function generateConfirmationURL(email_data: AuthHookRequest['email_data']) {
    const baseUrl = email_data.site_url + (process.env.NODE_ENV === 'production' ? '/verify' : '/auth/v1/verify');

    const params = new URLSearchParams({
        token: email_data.token_hash,
        type: email_data.email_action_type,
        redirect_to: email_data.redirect_to,
    });

    return `${baseUrl}?${params.toString()}`;
}

type AppConfig = Parameters<typeof renderConfirmEmailAddressEmail>[0]['appConfig'];

export const createAuthEmailWebhookHandler = (appConfig: AppConfig) => {
    return async (request: NextRequest) => {
        try {
            const payload = await request.text();
            const headers = Object.fromEntries(request.headers.entries());
            const { AUTH_WEBHOOK_SECRET } = envs.www();
            const base64_secret = AUTH_WEBHOOK_SECRET.replace('v1,whsec_', '');
            const wh = new Webhook(base64_secret);
            const authRequest = wh.verify(payload, headers) as AuthHookRequest;

            logger.info(
                {
                    event_type: authRequest.email_data.email_action_type,
                    user_id: authRequest.user.id,
                    email: authRequest.user.email,
                },
                'Processing auth hook event',
            );

            // Extract user information
            const userName =
                authRequest.user.user_metadata?.name ||
                authRequest.user.user_metadata?.full_name ||
                authRequest.user.email.split('@')[0];

            const confirmation_url = generateConfirmationURL(authRequest.email_data);

            // Prepare email based on event type
            let emailHtml: string;
            let emailSubject: string;

            switch (authRequest.email_data.email_action_type) {
                case 'signup': {
                    const emailData = await renderConfirmEmailAddressEmail({
                        appConfig,
                        name: userName!,
                        verificationLink: confirmation_url,
                    });
                    if (!emailData.subject) {
                        throw new Error(`Subject is missing for signup email`);
                    }
                    emailSubject = emailData.subject as string;
                    emailHtml = emailData.html;
                    break;
                }

                case 'invite': {
                    const emailData = await renderInviteUserEmail({
                        appConfig,
                        name: userName!,
                        inviteLink: confirmation_url,
                    });
                    if (!emailData.subject) {
                        throw new Error(`Subject is missing for invite email`);
                    }
                    emailSubject = emailData.subject as string;
                    emailHtml = emailData.html;
                    break;
                }

                case 'recovery': {
                    const emailData = await renderResetPasswordEmail({
                        appConfig,
                        resetPasswordLink: confirmation_url,
                    });
                    if (!emailData.subject) {
                        throw new Error(`Subject is missing for recovery email`);
                    }
                    emailSubject = emailData.subject as string;
                    emailHtml = emailData.html;
                    break;
                }

                case 'magic_link': {
                    const emailData = await renderMagicLinkEmail({
                        appConfig,
                        magicLink: confirmation_url,
                    });
                    if (!emailData.subject) {
                        throw new Error(`Subject is missing for magic link email`);
                    }
                    emailSubject = emailData.subject as string;
                    emailHtml = emailData.html;
                    break;
                }

                case 'email_change': {
                    const emailData = await renderConfirmChangeEmailAddressEmail({
                        appConfig,
                        confirmLink: confirmation_url,
                        newEmail: authRequest.user.email,
                    });
                    if (!emailData.subject) {
                        throw new Error(`Subject is missing for email change email`);
                    }
                    emailSubject = emailData.subject as string;
                    emailHtml = emailData.html;
                    break;
                }

                default:
                    logger.error({ event_type: authRequest.email_data.email_action_type }, 'Unknown event type');
                    return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
            }

            // Send the email using the configured email provider
            const providerResult = await EmailProvider.sendEmail({
                to: authRequest.user.email,
                subject: emailSubject,
                html: emailHtml,
                text: htmlToPlainText(emailHtml),
            });

            const providerResultObject =
                providerResult && typeof providerResult === 'object'
                    ? (providerResult as {
                          accepted?: unknown;
                          rejected?: unknown;
                          response?: unknown;
                          messageId?: unknown;
                      })
                    : null;

            const accepted = Array.isArray(providerResultObject?.accepted)
                ? providerResultObject.accepted.filter((value): value is string => typeof value === 'string')
                : [];
            const rejected = Array.isArray(providerResultObject?.rejected)
                ? providerResultObject.rejected.filter((value): value is string => typeof value === 'string')
                : [];
            const smtpResponse =
                typeof providerResultObject?.response === 'string' ? providerResultObject.response : null;
            const messageId =
                typeof providerResultObject?.messageId === 'string' ? providerResultObject.messageId : null;

            const hasSmtpDeliveryArrays =
                Array.isArray(providerResultObject?.accepted) || Array.isArray(providerResultObject?.rejected);

            if (hasSmtpDeliveryArrays) {
                const normalizedTarget = authRequest.user.email.trim().toLowerCase();
                const acceptedNormalized = accepted.map((value) => value.trim().toLowerCase());
                const rejectedNormalized = rejected.map((value) => value.trim().toLowerCase());

                if (
                    acceptedNormalized.length === 0 ||
                    rejectedNormalized.includes(normalizedTarget) ||
                    !acceptedNormalized.includes(normalizedTarget)
                ) {
                    throw new Error(
                        `Auth email provider did not accept target recipient. accepted=${accepted.join(',')} rejected=${rejected.join(',')} response=${smtpResponse ?? 'n/a'}`,
                    );
                }
            }

            logger.info(
                {
                    event_type: authRequest.email_data.email_action_type,
                    email: authRequest.user.email,
                    accepted,
                    rejected,
                    smtpResponse,
                    providerMessageId: messageId,
                },
                'Email sent successfully',
            );

            return NextResponse.json({
                success: true,
                message: 'Email sent successfully',
            });
        } catch (error) {
            logger.error({ error }, 'Error in auth hook');

            return NextResponse.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                { status: 500 },
            );
        }
    };
};
