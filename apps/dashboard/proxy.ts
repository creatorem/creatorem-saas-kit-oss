import { authProxy } from '@kit/auth/www/proxy/auth';
import { i18nProxy } from '@kit/i18n/www/proxy';
import { type NextRequest, NextResponse } from 'next/server';
import { authConfig } from './config/auth.config';
import { i18nConfig } from './config/i18n.config';

interface ProxyCall {
    proxy: (request: NextRequest, response: NextResponse) => NextResponse | Promise<NextResponse<unknown> | null>;
    behavior: 'chain';
}

const callProxies: ProxyCall[] = [
    {
       proxy: i18nProxy(i18nConfig),
       behavior: 'chain',
    },
    {
       proxy: authProxy(authConfig),
       behavior: 'chain',
    },
]

const callProxiesChain = async (request: NextRequest, proxies: ProxyCall[]): Promise<NextResponse<unknown>> => {
    let response = NextResponse.next();

    for (const proxy of proxies) {
        const newResponse = await proxy.proxy(request, response);
        if(newResponse){
            response = newResponse;
        }
    }

    return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse<unknown>> {
    return await callProxiesChain(request, callProxies);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)', '/dashboard/:path*'],
};
