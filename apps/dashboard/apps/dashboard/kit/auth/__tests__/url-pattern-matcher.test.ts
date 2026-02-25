import { matchUrlPattern, type PatternHandlerConfig } from '../src/proxy/url-pattern-matcher';

// Mock handler functions for testing
const mockHandler1 = jest.fn();
const mockHandler2 = jest.fn();
const mockHandler3 = jest.fn();

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

describe('matchUrlPattern', () => {
    describe('Basic pattern matching', () => {
        it('should match exact paths', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/login', handler: mockHandler1 }];

            const result = matchUrlPattern('/auth/login', patterns);
            expect(result).toBe(mockHandler1);
        });

        it('should not match different paths', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/login', handler: mockHandler1 }];

            const result = matchUrlPattern('/auth/signup', patterns);
            expect(result).toBeUndefined();
        });
    });

    describe('Wildcard pattern matching', () => {
        it('should match single wildcard patterns', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/login', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/signup', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/forgot-password', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/something', patterns)).toBe(mockHandler1);
        });

        it('should handle wildcards with optional suffix', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/*?', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/login', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/signup', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/', patterns)).toBe(mockHandler1);
        });

        it('should not match paths that do not start with the pattern prefix', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/dashboard/auth/login', patterns)).toBeUndefined();
            expect(matchUrlPattern('/login', patterns)).toBeUndefined();
            expect(matchUrlPattern('/authtest', patterns)).toBeUndefined();
        });
    });

    describe('Group pattern matching', () => {
        it('should match group patterns with pipe operator', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/(dashboard|onboarding)/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/dashboard/home', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/onboarding/step1', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/dashboard/settings', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/onboarding/profile', patterns)).toBe(mockHandler1);
        });

        it('should match group patterns with optional suffix', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/(dashboard|onboarding)/*?', handler: mockHandler1 }];

            expect(matchUrlPattern('/dashboard/users', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/onboarding/profile', patterns)).toBe(mockHandler1);
        });

        it('should not match paths outside the group', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/(dashboard|onboarding)/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/login', patterns)).toBeUndefined();
            expect(matchUrlPattern('/settings/profile', patterns)).toBeUndefined();
            expect(matchUrlPattern('/admin/users', patterns)).toBeUndefined();
        });
    });

    describe('Complex pattern scenarios', () => {
        it('should match nested paths with wildcards', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/api/*/users/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/api/v1/users/123', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/api/v2/users/profile', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/api/admin/users/list', patterns)).toBe(mockHandler1);
        });

        it('should handle multiple wildcard segments', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/*/dashboard/*/settings', handler: mockHandler1 }];

            expect(matchUrlPattern('/org1/dashboard/admin/settings', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/tenant/dashboard/user/settings', patterns)).toBe(mockHandler1);
        });
    });

    describe('Pattern priority and first match', () => {
        it('should return the first matching pattern', () => {
            const patterns: PatternHandlerConfig[] = [
                { pattern: '/auth/*', handler: mockHandler1 },
                { pattern: '/auth/login', handler: mockHandler2 },
                { pattern: '/auth/*', handler: mockHandler3 },
            ];

            const result = matchUrlPattern('/auth/login', patterns);
            expect(result).toBe(mockHandler1);
        });

        it('should check patterns in order until first match', () => {
            const patterns: PatternHandlerConfig[] = [
                { pattern: '/dashboard/*', handler: mockHandler1 },
                { pattern: '/auth/*', handler: mockHandler2 },
                { pattern: '/onboarding/*', handler: mockHandler3 },
            ];

            expect(matchUrlPattern('/auth/login', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/onboarding/step1', patterns)).toBe(mockHandler3);
            expect(matchUrlPattern('/dashboard/home', patterns)).toBe(mockHandler1);
        });
    });

    describe('Real-world auth patterns', () => {
        it('should match typical auth patterns used in the application', () => {
            const patterns: PatternHandlerConfig[] = [
                { pattern: '/auth/*?', handler: mockHandler1 },
                { pattern: '/(dashboard|onboarding)/*?', handler: mockHandler2 },
            ];

            // Auth routes
            expect(matchUrlPattern('/auth/sign-in', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/sign-up', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/callback', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/verify-mfa', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/forgotten-password', patterns)).toBe(mockHandler1);

            // Private routes
            expect(matchUrlPattern('/dashboard', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/dashboard/users', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/dashboard/org/settings', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/onboarding', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/onboarding/user', patterns)).toBe(mockHandler2);
            expect(matchUrlPattern('/onboarding/organization', patterns)).toBe(mockHandler2);
        });

        it('should not match non-auth/non-private routes', () => {
            const patterns: PatternHandlerConfig[] = [
                { pattern: '/auth/*?', handler: mockHandler1 },
                { pattern: '/(dashboard|onboarding)/*?', handler: mockHandler2 },
            ];

            expect(matchUrlPattern('/', patterns)).toBeUndefined();
            expect(matchUrlPattern('/api/health', patterns)).toBeUndefined();
            expect(matchUrlPattern('/public/about', patterns)).toBeUndefined();
            expect(matchUrlPattern('/contact', patterns)).toBeUndefined();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty patterns array', () => {
            const result = matchUrlPattern('/any/path', []);
            expect(result).toBeUndefined();
        });

        it('should handle empty pathname', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/*', handler: mockHandler1 }];

            const result = matchUrlPattern('', patterns);
            expect(result).toBeUndefined();
        });

        it('should handle root path with wildcard', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/*', handler: mockHandler1 }];

            const result = matchUrlPattern('/home', patterns);
            expect(result).toBe(mockHandler1);
        });

        it('should handle paths without requiring trailing slashes', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/login', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/signup', patterns)).toBe(mockHandler1);
        });

        it('should handle paths with special characters', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/sign-in', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/forgot_password', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/auth/verify-mfa', patterns)).toBe(mockHandler1);
        });

        it('should be case sensitive', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/Auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/auth/login', patterns)).toBeUndefined();
            expect(matchUrlPattern('/Auth/login', patterns)).toBe(mockHandler1);
        });
    });

    describe('Regex pattern conversion', () => {
        it('should properly escape forward slashes in regex', () => {
            const patterns: PatternHandlerConfig[] = [{ pattern: '/api/v1/auth/*', handler: mockHandler1 }];

            expect(matchUrlPattern('/api/v1/auth/login', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/api/v1/authtest', patterns)).toBeUndefined();
        });

        it('should handle complex group patterns', () => {
            const patterns: PatternHandlerConfig[] = [
                { pattern: '/(api|admin)/(v1|v2)/auth/*', handler: mockHandler1 },
            ];

            expect(matchUrlPattern('/api/v1/auth/login', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/admin/v2/auth/users', patterns)).toBe(mockHandler1);
            expect(matchUrlPattern('/api/v3/auth/login', patterns)).toBeUndefined();
            expect(matchUrlPattern('/public/v1/auth/login', patterns)).toBeUndefined();
        });
    });
});
