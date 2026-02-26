// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock all required environment variables for tests
// These are minimal values needed for tests to run
process.env.NEXT_PUBLIC_DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';
process.env.NEXT_PUBLIC_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://test@sentry.io/test';
process.env.NEXT_PUBLIC_MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001';

// Global test utilities
beforeEach(() => {
    // Clear any mocks before each test
    jest.clearAllMocks();
});

afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
});
