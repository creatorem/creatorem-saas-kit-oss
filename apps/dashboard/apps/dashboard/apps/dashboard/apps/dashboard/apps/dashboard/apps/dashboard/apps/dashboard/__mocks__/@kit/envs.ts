/**
 * Mock for @kit/shared/envs
 * Used to prevent loading ESM modules during Jest test execution
 */

export const envs = () => ({
    NEXT_PUBLIC_MARKETING_URL: 'http://localhost:3001',
    NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3000',
});
