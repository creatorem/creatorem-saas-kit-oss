import withBundleAnalyzer from '@next/bundle-analyzer';
import { type NextConfig } from 'next/types';
import { createSecureHeaders } from 'next-secure-headers';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const INTERNAL_PACKAGES = [
    '@kit/analytics',
    '@kit/auth',
    '@kit/billing',
    '@kit/notification',
    '@kit/content-type',
    '@kit/db',
    '@kit/drizzle',
    '@kit/email-templates',
    '@kit/emailer',
    '@kit/eslint-config',
    '@kit/i18n',
    '@kit/keybindings',
    '@kit/monitoring',
    '@kit/organization',
    '@kit/prettier-config',
    '@kit/settings',
    '@kit/utils',
    '@kit/supabase',
    '@kit/supabase-server',
    '@kit/tailwind-config',
    '@kit/tsconfig',
    '@kit/shared',
    '@kit/ui',
];

const svgLoader = {
    loader: '@svgr/webpack',
    options: {
        svgoConfig: {
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            removeViewBox: false, // Preserve the viewBox attribute
                        },
                    },
                },
            ],
        },
    },
};

const config: NextConfig = {
    reactStrictMode: true,
    typedRoutes: true,
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: INTERNAL_PACKAGES,
    // Keep default behavior; don't force-prevent or -add prettier externals here
    serverExternalPackages: [
        'pino',
        'pino-pretty',
        'thread-stream',
        'sonic-boom',
        'atomic-sleep',
        'real-require',
        'quick-format-unescaped',
        'typescript',
    ],
    images: {
        remotePatterns: getRemotePatterns(),
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    /* MDX tracing */
    outputFileTracingIncludes: {
        '/*': ['./content/**/*'],
    },
    redirects: getRedirects,
    turbopack: {
        resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
        rules: {
            '*.svg': {
                loaders: [svgLoader],
                as: '*.js',
            },
        },
    },
    experimental: {
        optimizePackageImports: [
            'recharts',
            'lucide-react',
            '@radix-ui/react-avatar',
            '@radix-ui/react-select',
            'date-fns',
            ...INTERNAL_PACKAGES,
        ],
        mdxRs: true,
        typedEnv: true,
    },
    poweredByHeader: false,
    async headers() {
        return [
            {
                locale: false,
                source: '/(.*)',
                headers: createSecureHeaders({
                    // Disable frameGuard to use CSP frame-ancestors instead
                    frameGuard: false,
                    noopen: 'noopen',
                    nosniff: 'nosniff',
                    xssProtection: 'sanitize',
                    forceHTTPSRedirect: IS_PRODUCTION
                        ? [true, { maxAge: 60 * 60 * 24 * 360, includeSubDomains: true }]
                        : false,
                    referrerPolicy: 'same-origin',
                    contentSecurityPolicy: {
                        directives: {
                            // Allow embedding from creatorem.com in production, localhost in development
                            frameAncestors: IS_PRODUCTION
                                ? ["'self'", 'https://creatorem.com', 'https://*.creatorem.com']
                                : ["'self'", 'http://localhost:*', 'http://127.0.0.1:*'],
                        },
                    },
                }),
            },
        ];
    },
    modularizeImports: {
        lodash: {
            transform: 'lodash/{{member}}',
        },
    },
    typescript: { ignoreBuildErrors: true },
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.svg$/i,
            use: [svgLoader],
        });

        // Exclude test files, LICENSE, and other non-code files from being parsed
        config.module.rules.push({
            test: /node_modules\/(pino|thread-stream|sonic-boom|pino-pretty|atomic-sleep|real-require)\/(test|tests|LICENSE|\.md|\.txt)/,
            type: 'asset/source',
        });

        // Also exclude specific problematic files
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias,
            'thread-stream/test': false,
            'thread-stream/LICENSE': false,
        };

        if (isServer) {
            config.ignoreWarnings = [{ module: /opentelemetry/ }];
        }

        return config;
    },
};

export default withBundleAnalyzer({
    enabled: process.env.ANALYZE_BUNDLE === 'true',
})(config)

function getRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
    const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

    // Add Supabase hostname if available
    if (SUPABASE_URL) {
        const hostname = new URL(SUPABASE_URL).hostname;

        remotePatterns.push({
            protocol: 'https',
            hostname,
        });
    }

    // Add previously deprecated domains as remote patterns
    const additionalDomains = ['lh3.googleusercontent.com', 'flagcdn.com', 'picsum.photos', 'ui.shadcn.com'];

    additionalDomains.forEach((domain) => {
        remotePatterns.push({
            protocol: 'https',
            hostname: domain,
        });
    });

    return IS_PRODUCTION
        ? remotePatterns
        : [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '54321',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '54321',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            ...remotePatterns,
        ];
}

async function getRedirects() {
    return [
        {
            source: '/',
            destination: '/auth',
            permanent: false,
        },
        {
            source: '/auth',
            destination: '/auth/sign-in',
            permanent: false,
        },
    ];
}
