import dotenv from 'dotenv';
import type { Config } from 'jest';
import path from 'path';

// Set NODE_ENV to test before anything else
process.env.NODE_ENV = 'test';

// Load test environment variables from .env.test
const envPath = path.resolve(__dirname, '.env.test');
dotenv.config({ path: envPath });

const config: Config = {
    displayName: 'dashboard',
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^~/(.*)$': '<rootDir>/$1',
        '^@kit/shared/envs$': '<rootDir>/__mocks__/@kit/envs.ts',
        '^@t3-oss/env-nextjs$': '<rootDir>/__mocks__/envs.ts',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    jsx: 'react',
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    module: 'esnext',
                    target: 'es2020',
                    types: ['jest', 'node'],
                },
            },
        ],
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/coverage/', '<rootDir>/dist/'],
    collectCoverageFrom: [
        'lib/**/*.{js,jsx,ts,tsx}',
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/dist/**',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;
