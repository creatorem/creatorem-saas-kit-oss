/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@kit/ui', '@kit/utils'],
    experimental: {
        esmExternals: 'loose',
    },
};

module.exports = nextConfig;
