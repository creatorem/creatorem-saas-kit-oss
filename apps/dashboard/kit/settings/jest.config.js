/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@kit/(ui|shared|supabase-client)$': '<rootDir>/__tests__/__mocks__/kitModules.ts',
        '^@kit/(ui|shared|supabase-client)/(.*)$': '<rootDir>/__tests__/__mocks__/kitModules.ts',
        '^@kit/(.*)$': '<rootDir>/../../../$1/src',
        '^../src/components/setting-form-client$': '<rootDir>/__tests__/__mocks__/setting-form-client.tsx',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
    testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.test.json',
                isolatedModules: true,
            },
        ],
    },
    testPathIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: ['/node_modules/(?!(@kit)/)'],
    rootDir: '.',
    verbose: true,
};
