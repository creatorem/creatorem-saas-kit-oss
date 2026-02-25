import { NextRequest, NextResponse } from 'next/server';

const MAX_SLUG_LENGTH = 255;

/**
 * Pass organization slug to the headers.
 */
export const organizationProxy = async (request: NextRequest, response: NextResponse) => {
    // Extract slug from the URL path
    const path = request.nextUrl.pathname;
    const pathSegments = path.split('/').filter((segment) => segment !== '');

    // Check for the specific pattern: /dashboard/slug
    let slug = null;
    if (pathSegments.length >= 2 && pathSegments[0] === 'dashboard') {
        slug = pathSegments[1];
    }

    if (slug && slug.length <= MAX_SLUG_LENGTH) {
        response.headers.set('x-organization-slug', slug);
        response.cookies.set('organizationSlug', slug, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
        });
    }

    return response;
};
