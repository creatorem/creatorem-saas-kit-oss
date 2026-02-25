import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-onboarding',
        '@storybook/addon-interactions',
    ],

    framework: {
        name: '@storybook/nextjs',
        options: {
            nextConfigPath: path.resolve(__dirname, '../next.config.js'),
        },
    },

    typescript: {
        check: false,
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
    },

    // Webpack configuration for monorepo
    webpackFinal: async (config, { configType }) => {
        if (config.resolve) {
            // Map @kit/ui exports to their actual file paths
            config.resolve.alias = {
                ...config.resolve.alias,
                '@kit/utils$': path.resolve(__dirname, '../../shared/src/index.ts'),
                '@kit/ui/button$': path.resolve(__dirname, '../../www/ui/src/shadcn/button.tsx'),
                '@kit/ui/input$': path.resolve(__dirname, '../../www/ui/src/shadcn/input.tsx'),
                '@kit/ui/label$': path.resolve(__dirname, '../../www/ui/src/shadcn/label.tsx'),
                '@kit/ui/form$': path.resolve(__dirname, '../../www/ui/src/shadcn/form.tsx'),
                '@kit/ui/card$': path.resolve(__dirname, '../../www/ui/src/shadcn/card.tsx'),
                '@kit/ui/select$': path.resolve(__dirname, '../../www/ui/src/shadcn/select.tsx'),
                '@kit/ui/separator$': path.resolve(__dirname, '../../www/ui/src/shadcn/separator.tsx'),
                '@kit/ui/badge$': path.resolve(__dirname, '../../www/ui/src/shadcn/badge.tsx'),
                '@kit/ui/dialog$': path.resolve(__dirname, '../../www/ui/src/shadcn/dialog.tsx'),
                '@kit/ui/drawer$': path.resolve(__dirname, '../../www/ui/src/shadcn/drawer.tsx'),
                '@kit/ui/sonner$': path.resolve(__dirname, '../../www/ui/src/shadcn/sonner.tsx'),
                '@kit/ui/spinner$': path.resolve(__dirname, '../../www/ui/src/components/spinner.tsx'),
                '@kit/ui/icon$': path.resolve(__dirname, '../../www/ui/src/icon.tsx'),
                '@kit/ui/utils$': path.resolve(__dirname, '../../www/ui/src/lib/utils/index.ts'),
                '@kit/ui/hooks/use-media-query$': path.resolve(__dirname, '../../www/ui/src/hooks/use-media-query.ts'),
                '@kit/shared/hooks$': path.resolve(__dirname, '../../www/ui/src/hooks/use-zod-form.ts'),
                '@kit/ui/data-table$': path.resolve(__dirname, '../../www/ui/src/components/data-table.tsx'),
                '@kit/ui/checkbox$': path.resolve(__dirname, '../../www/ui/src/shadcn/checkbox.tsx'),
                '@kit/ui/dropdown-menu$': path.resolve(__dirname, '../../www/ui/src/shadcn/dropdown-menu.tsx'),
                '@kit/ui/scroll-area$': path.resolve(__dirname, '../../www/ui/src/shadcn/scroll-area.tsx'),
                '@kit/ui/table$': path.resolve(__dirname, '../../www/ui/src/shadcn/table.tsx'),
                '@kit/ui/textarea$': path.resolve(__dirname, '../../www/ui/src/shadcn/textarea.tsx'),
                '@kit/ui/radio-group$': path.resolve(__dirname, '../../www/ui/src/shadcn/radio-group.tsx'),
                '@kit/ui/avatar$': path.resolve(__dirname, '../../www/ui/src/shadcn/avatar.tsx'),
                '@kit/ui/chart$': path.resolve(__dirname, '../../www/ui/src/shadcn/chart.tsx'),
                '@kit/ui/empty-state$': path.resolve(__dirname, '../../www/ui/src/components/empty-state.tsx'),
            };

            // Configure fallback for node_modules resolution
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }

        // Simple CSS configuration - let Next.js handle PostCSS
        // The postcss.config.js file should be picked up automatically

        return config;
    },

    docs: {
        autodocs: 'tag',
    },

    staticDirs: [],
};

export default config;
