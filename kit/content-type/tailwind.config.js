import sharedConfig from '../../tooling/tailwind-config/index.js';

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...sharedConfig,
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './.storybook/**/*.{js,ts,jsx,tsx}',
        '../../../kit/ui/www/src/**/*.{js,ts,jsx,tsx}',
    ],
    // Ensure blocklist is defined for compatibility
    blocklist: [],
};
