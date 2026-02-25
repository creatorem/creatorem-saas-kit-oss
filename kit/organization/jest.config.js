/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@kit/db$': '<rootDir>/../../db/core/src',
        '^@kit/drizzle$': '<rootDir>/../../db/drizzle/src',
        '^@kit/utils$': '<rootDir>/../../shared/src',
        '^@kit/supabase-server$': '<rootDir>/../../db/supabase/server/src',
        '^@kit/utils/next$': '<rootDir>/../../shared/src/next-action-client',
        '^@kit/(.*)$': '<rootDir>/../../$1/src',
    },
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**', '!src/**/index.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react',
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                },
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
