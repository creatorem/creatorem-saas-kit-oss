import type { Preview } from '@storybook/nextjs';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import './globals.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        // Enable responsive viewport addon
        viewport: {
            viewports: {
                mobile: {
                    name: 'Mobile',
                    styles: {
                        width: '375px',
                        height: '667px',
                    },
                },
                tablet: {
                    name: 'Tablet',
                    styles: {
                        width: '768px',
                        height: '1024px',
                    },
                },
                desktop: {
                    name: 'Desktop',
                    styles: {
                        width: '1200px',
                        height: '800px',
                    },
                },
            },
        },
        // Configure Next.js router
        nextjs: {
            appDirectory: true,
            navigation: {
                pathname: '/',
                query: {},
            },
        },
        // Test runner configuration
        test: {
            // Include interaction tests
            includeStories: /.*\.stories\.(js|jsx|ts|tsx|mdx)$/,
            excludeStories: /.*\.skip\.stories\.(js|jsx|ts|tsx|mdx)$/,
        },
    },

    // Global decorators
    decorators: [
        (Story) => (
            <NuqsTestingAdapter>
                <Story />
            </NuqsTestingAdapter>
        ),
    ],

    tags: ['autodocs'],
};

export default preview;
