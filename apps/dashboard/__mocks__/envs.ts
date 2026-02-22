// Mock envs for testing
export const envs = () => ({
    NEXT_PUBLIC_MARKETING_URL: 'http://localhost:3001',
    NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: 'test-captcha-key',
    NEXT_PUBLIC_APP_NAME: 'Test Dashboard',
    AUTH_WEBHOOK_SECRET: 'test-webhook-secret',
    SUPABASE_DATABASE_URL: 'postgresql://user:password@localhost:5432/test_db',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    EMAIL_FROM: 'test@example.com',
});
