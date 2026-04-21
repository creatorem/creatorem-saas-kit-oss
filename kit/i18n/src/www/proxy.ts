/**
 * i18n proxy aims only to improve server side lang detection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { I18nConfig } from '../config';
import { I18N_COOKIE_NAME, I18N_HEADER_NAME } from '../shared/constants';
import acceptLanguage from '../shared/utils/accept-language';

const getLanguageFromCookies = (req: NextRequest): string | null => {
    let lng: string | null = null;
    // Try to get language from cookie
    if (req.cookies.has(I18N_COOKIE_NAME)) lng = acceptLanguage.get(req.cookies.get(I18N_COOKIE_NAME)?.value);
    // If no cookie, check the Accept-Language header
    if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
    return lng;
};

const getLanguageFromUrl = (req: NextRequest, config: I18nConfig): string | null => {
    const pathname = req.nextUrl.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] || '';

    if (config.languages.includes(firstSegment)) {
        return firstSegment;
    }

    return null;
};

const getLanguageFromQuery = (req: NextRequest, config: I18nConfig): string | null => {
    const langParam = req.nextUrl.searchParams.get('lang');
    const localeParam = req.nextUrl.searchParams.get('locale');
    const candidate = (langParam ?? localeParam)?.trim().toLowerCase();
    if (!candidate) {
        return null;
    }

    return config.languages.includes(candidate) ? candidate : null;
};

export const i18nProxy = (config: I18nConfig) => (req: NextRequest, res: NextResponse):NextResponse => {
    acceptLanguage.languages(config.languages);

    if (config.useRouting) {
        const lng = getLanguageFromUrl(req, config);
        if (lng) {
            res.headers.set(I18N_HEADER_NAME, lng);
        }
    } else {
        const lng =
            getLanguageFromQuery(req, config) ??
            getLanguageFromCookies(req);

        if (lng) {
            res.headers.set(I18N_HEADER_NAME, lng);
        } else {
            res.headers.delete(I18N_HEADER_NAME);
        }
    }

    return res;
};
