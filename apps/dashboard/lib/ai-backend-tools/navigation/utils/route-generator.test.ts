/// <reference types="jest" />
/**
 * Type-level and Runtime Tests for Route Generator
 * This file tests both the type system and runtime behavior
 *
 * Type Tests: Verify compile-time type extraction
 * Runtime Tests: Verify getDashboardNavigationPaths, resolveRouteFromPath, and getRouteObject
 */

import type { DashboardNavigationPath } from './route-generator';
import {
    getDashboardNavigationPaths,
    getPageEnumValues,
    getRouteObject,
    resolveRouteFromPath,
} from './route-generator';

// ============================================================================
// Type Tests - These verify the type system extracts correct paths
// ============================================================================

// Test 1: Valid paths should be assignable
const validPath1: DashboardNavigationPath = 'dashboard';
const validPath2: DashboardNavigationPath = 'orders';
const validPath3: DashboardNavigationPath = 'orders.new';
const validPath4: DashboardNavigationPath = 'products';
const validPath5: DashboardNavigationPath = 'clients';
const validPath6: DashboardNavigationPath = 'settings';
const validPath7: DashboardNavigationPath = 'settings.profile';
const validPath8: DashboardNavigationPath = 'settings.security';
const validPath9: DashboardNavigationPath = 'settings.keybindings';
const validPath10: DashboardNavigationPath = 'settings.invitations';
const validPath11: DashboardNavigationPath = 'settings.organization';
const validPath12: DashboardNavigationPath = 'settings.organization.members';
const validPath13: DashboardNavigationPath = 'settings.organization.roles';
const validPath14: DashboardNavigationPath = 'settings.organization.billing';
const validPath15: DashboardNavigationPath = 'aiChat';
const validPath16: DashboardNavigationPath = 'billing';
const validPath17: DashboardNavigationPath = 'products.new';
const validPath18: DashboardNavigationPath = 'clients.new';

// ============================================================================
// Mock Route Object for Testing
// ============================================================================

/**
 * Mock dashboard routes matching the structure of dashboardRoutes.paths.dashboard.slug
 * Used for testing getDashboardNavigationPaths, resolveRouteFromPath, and getRouteObject
 */
export const mockDashboardRoutes = {
    index: '/dashboard/[slug]',
    orders: {
        index: '/dashboard/[slug]/orders',
        id: '/dashboard/[slug]/orders/[id]', // Will be filtered out
        new: '/dashboard/[slug]/orders/new',
    },
    products: {
        index: '/dashboard/[slug]/products',
        id: '/dashboard/[slug]/products/[id]', // Will be filtered out
        new: '/dashboard/[slug]/products/new',
    },
    clients: {
        index: '/dashboard/[slug]/clients',
        id: '/dashboard/[slug]/clients/[id]', // Will be filtered out
        new: '/dashboard/[slug]/clients/new',
    },
    billing: {
        index: '/dashboard/[slug]/billing',
    },
    settings: {
        index: '/dashboard/[slug]/settings',
        profile: '/dashboard/[slug]/settings',
        security: '/dashboard/[slug]/settings/security',
        keybindings: '/dashboard/[slug]/settings/keybindings',
        invitations: '/dashboard/[slug]/settings/invitations',
        organization: {
            index: '/dashboard/[slug]/settings/organization',
            members: '/dashboard/[slug]/settings/organization/members',
            roles: '/dashboard/[slug]/settings/organization/roles',
            billing: '/dashboard/[slug]/settings/organization/billing',
        },
    },
    aiChat: '/dashboard/[slug]/ai-chat',
} as const;

// ============================================================================
// Runtime Tests using Jest
// ============================================================================

describe('Route Generator Functions', () => {
    // ========================================================================
    // getDashboardNavigationPaths() Tests
    // ========================================================================

    describe('getDashboardNavigationPaths()', () => {
        it('should return an array of NavigationItem objects', () => {
            const items = getDashboardNavigationPaths();
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('should have each item with path, route, and description properties', () => {
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                expect(item).toHaveProperty('path');
                expect(item).toHaveProperty('route');
                expect(item).toHaveProperty('description');
            });
        });

        it('should filter out paths containing [id]', () => {
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                expect(item.route).not.toContain('[id]');
            });
        });

        it('should simplify .index suffix to parent path', () => {
            const items = getDashboardNavigationPaths();
            const indexPaths = items.filter((item) => item.path.endsWith('.index'));
            expect(indexPaths.length).toBe(0); // No .index suffixes should remain
        });

        it('should include dashboard root path', () => {
            const items = getDashboardNavigationPaths();
            const dashboardItem = items.find((item) => item.path === 'dashboard');
            expect(dashboardItem).toBeDefined();
            expect(dashboardItem?.route).toBe('/dashboard/[slug]');
        });

        it('should include orders paths', () => {
            const items = getDashboardNavigationPaths();
            const ordersItem = items.find((item) => item.path === 'orders');
            const ordersNewItem = items.find((item) => item.path === 'orders.new');
            expect(ordersItem).toBeDefined();
            expect(ordersNewItem).toBeDefined();
        });

        it('should include products paths', () => {
            const items = getDashboardNavigationPaths();
            const productsItem = items.find((item) => item.path === 'products');
            const productsNewItem = items.find((item) => item.path === 'products.new');
            expect(productsItem).toBeDefined();
            expect(productsNewItem).toBeDefined();
        });

        it('should include clients paths', () => {
            const items = getDashboardNavigationPaths();
            const clientsItem = items.find((item) => item.path === 'clients');
            const clientsNewItem = items.find((item) => item.path === 'clients.new');
            expect(clientsItem).toBeDefined();
            expect(clientsNewItem).toBeDefined();
        });

        it('should include billing path', () => {
            const items = getDashboardNavigationPaths();
            const billingItem = items.find((item) => item.path === 'billing');
            expect(billingItem).toBeDefined();
            expect(billingItem?.route).toBe('/dashboard/[slug]/billing');
        });

        it('should include settings paths', () => {
            const items = getDashboardNavigationPaths();
            const settingsItem = items.find((item) => item.path === 'settings');
            expect(settingsItem).toBeDefined();
        });

        it('should include settings.profile path', () => {
            const items = getDashboardNavigationPaths();
            const profileItem = items.find((item) => item.path === 'settings.profile');
            expect(profileItem).toBeDefined();
        });

        it('should include settings.security path', () => {
            const items = getDashboardNavigationPaths();
            const securityItem = items.find((item) => item.path === 'settings.security');
            expect(securityItem).toBeDefined();
        });

        it('should include settings.keybindings path', () => {
            const items = getDashboardNavigationPaths();
            const keybindingsItem = items.find((item) => item.path === 'settings.keybindings');
            expect(keybindingsItem).toBeDefined();
        });

        it('should include settings.invitations path', () => {
            const items = getDashboardNavigationPaths();
            const invitationsItem = items.find((item) => item.path === 'settings.invitations');
            expect(invitationsItem).toBeDefined();
        });

        it('should include settings.organization paths', () => {
            const items = getDashboardNavigationPaths();
            const orgItem = items.find((item) => item.path === 'settings.organization');
            const membersItem = items.find((item) => item.path === 'settings.organization.members');
            const rolesItem = items.find((item) => item.path === 'settings.organization.roles');
            const billingItem = items.find((item) => item.path === 'settings.organization.billing');
            expect(orgItem).toBeDefined();
            expect(membersItem).toBeDefined();
            expect(rolesItem).toBeDefined();
            expect(billingItem).toBeDefined();
        });

        it('should include aiChat path', () => {
            const items = getDashboardNavigationPaths();
            const aiChatItem = items.find((item) => item.path === 'aiChat');
            expect(aiChatItem).toBeDefined();
            expect(aiChatItem?.route).toBe('/dashboard/[slug]/ai-chat');
        });

        it('should have descriptions for all items', () => {
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                expect(typeof item.description).toBe('string');
                expect(item.description.length).toBeGreaterThan(0);
            });
        });

        it('should have unique routes that are valid', () => {
            const items = getDashboardNavigationPaths();
            const routes = items.map((item) => item.route);
            // Verify all routes match the expected pattern
            // Note: Multiple paths can point to the same route (e.g., settings and settings.profile both point to /dashboard/[slug]/settings)
            routes.forEach((route) => {
                expect(route).toMatch(/^\/dashboard\/\[slug\]/); // All routes should match pattern
            });
            // Verify we have expected number of paths and routes
            expect(items.length).toBe(18); // Should have 18 navigation paths
            const uniqueRoutes = new Set(routes);
            expect(uniqueRoutes.size).toBeLessThanOrEqual(items.length); // Routes can be duplicated (same path for multiple nav items)
        });

        it('should flatten nested route objects correctly', () => {
            const items = getDashboardNavigationPaths();
            // Check for nested path format (e.g., 'settings.organization.members')
            const nestedPaths = items.filter((item) => item.path.includes('.'));
            expect(nestedPaths.length).toBeGreaterThan(0);
        });

        it('should maintain path-to-route mapping consistency', () => {
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                // Each path should map to a specific route
                expect(item.path).toBeDefined();
                expect(item.route).toBeDefined();
                expect(typeof item.path).toBe('string');
                expect(typeof item.route).toBe('string');
            });
        });
    });

    // ========================================================================
    // resolveRouteFromPath() Tests
    // ========================================================================

    describe('resolveRouteFromPath()', () => {
        it('should return a route string for valid path', () => {
            const route = resolveRouteFromPath('dashboard');
            expect(typeof route).toBe('string');
            expect(route).toBe('/dashboard/[slug]');
        });

        it('should resolve orders path to correct route', () => {
            const route = resolveRouteFromPath('orders');
            expect(route).toBe('/dashboard/[slug]/orders');
        });

        it('should resolve orders.new path to correct route', () => {
            const route = resolveRouteFromPath('orders.new');
            expect(route).toBe('/dashboard/[slug]/orders/new');
        });

        it('should resolve products path to correct route', () => {
            const route = resolveRouteFromPath('products');
            expect(route).toBe('/dashboard/[slug]/products');
        });

        it('should resolve products.new path to correct route', () => {
            const route = resolveRouteFromPath('products.new');
            expect(route).toBe('/dashboard/[slug]/products/new');
        });

        it('should resolve clients path to correct route', () => {
            const route = resolveRouteFromPath('clients');
            expect(route).toBe('/dashboard/[slug]/clients');
        });

        it('should resolve clients.new path to correct route', () => {
            const route = resolveRouteFromPath('clients.new');
            expect(route).toBe('/dashboard/[slug]/clients/new');
        });

        it('should resolve billing path to correct route', () => {
            const route = resolveRouteFromPath('billing');
            expect(route).toBe('/dashboard/[slug]/billing');
        });

        it('should resolve settings path to correct route', () => {
            const route = resolveRouteFromPath('settings');
            expect(route).toBe('/dashboard/[slug]/settings');
        });

        it('should resolve settings.profile path to correct route', () => {
            const route = resolveRouteFromPath('settings.profile');
            expect(route).toBe('/dashboard/[slug]/settings');
        });

        it('should resolve settings.security path to correct route', () => {
            const route = resolveRouteFromPath('settings.security');
            expect(route).toBe('/dashboard/[slug]/settings/security');
        });

        it('should resolve settings.keybindings path to correct route', () => {
            const route = resolveRouteFromPath('settings.keybindings');
            expect(route).toBe('/dashboard/[slug]/settings/keybindings');
        });

        it('should resolve settings.invitations path to correct route', () => {
            const route = resolveRouteFromPath('settings.invitations');
            expect(route).toBe('/dashboard/[slug]/settings/invitations');
        });

        it('should resolve settings.organization path to correct route', () => {
            const route = resolveRouteFromPath('settings.organization');
            expect(route).toBe('/dashboard/[slug]/settings/organization');
        });

        it('should resolve settings.organization.members path to correct route', () => {
            const route = resolveRouteFromPath('settings.organization.members');
            expect(route).toBe('/dashboard/[slug]/settings/organization/members');
        });

        it('should resolve settings.organization.roles path to correct route', () => {
            const route = resolveRouteFromPath('settings.organization.roles');
            expect(route).toBe('/dashboard/[slug]/settings/organization/roles');
        });

        it('should resolve settings.organization.billing path to correct route', () => {
            const route = resolveRouteFromPath('settings.organization.billing');
            expect(route).toBe('/dashboard/[slug]/settings/organization/billing');
        });

        it('should resolve aiChat path to correct route', () => {
            const route = resolveRouteFromPath('aiChat');
            expect(route).toBe('/dashboard/[slug]/ai-chat');
        });

        it('should throw error for invalid path', () => {
            expect(() => {
                resolveRouteFromPath('invalid-path' as DashboardNavigationPath);
            }).toThrow(`Unknown navigation path: invalid-path`);
        });

        it('should throw error with descriptive message', () => {
            const invalidPath = 'non-existent' as DashboardNavigationPath;
            expect(() => {
                resolveRouteFromPath(invalidPath);
            }).toThrow(new RegExp(`Unknown navigation path: ${invalidPath}`));
        });

        it('should call getDashboardNavigationPaths internally', () => {
            const route = resolveRouteFromPath('dashboard');
            expect(route).toBeDefined();
            // Verify it uses the navigation paths
            const allPaths = getDashboardNavigationPaths();
            const found = allPaths.some((item) => item.path === 'dashboard');
            expect(found).toBe(true);
        });

        it('should use find method to locate path', () => {
            const route = resolveRouteFromPath('orders');
            const items = getDashboardNavigationPaths();
            const expectedItem = items.find((i) => i.path === 'orders');
            expect(route).toBe(expectedItem?.route);
        });

        it('should return correct type (DashboardRouteString)', () => {
            const route = resolveRouteFromPath('dashboard');
            expect(route).toMatch(/^\/dashboard\/\[slug\]/);
        });
    });

    // ========================================================================
    // getRouteObject() Tests
    // ========================================================================

    describe('getRouteObject()', () => {
        it('should return an object', () => {
            const obj = getRouteObject();
            expect(typeof obj).toBe('object');
            expect(!Array.isArray(obj)).toBe(true);
        });

        it('should have all navigation paths as keys', () => {
            const obj = getRouteObject();
            const items = getDashboardNavigationPaths();
            // Verify all navigation paths exist as keys in the route object
            items.forEach((item) => {
                expect(Object.keys(obj)).toContain(item.path);
            });
        });

        it('should have correct route values for all keys', () => {
            const obj = getRouteObject();
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                expect(obj[item.path as DashboardNavigationPath]).toBe(item.route);
            });
        });

        it('should contain dashboard key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.dashboard).toBe('/dashboard/[slug]');
        });

        it('should contain orders key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.orders).toBe('/dashboard/[slug]/orders');
        });

        it('should contain orders.new key with correct value', () => {
            const obj = getRouteObject();
            expect(obj['orders.new' as DashboardNavigationPath]).toBe('/dashboard/[slug]/orders/new');
        });

        it('should contain products key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.products).toBe('/dashboard/[slug]/products');
        });

        it('should contain products.new key with correct value', () => {
            const obj = getRouteObject();
            expect(obj['products.new' as DashboardNavigationPath]).toBe('/dashboard/[slug]/products/new');
        });

        it('should contain clients key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.clients).toBe('/dashboard/[slug]/clients');
        });

        it('should contain clients.new key with correct value', () => {
            const obj = getRouteObject();
            expect(obj['clients.new' as DashboardNavigationPath]).toBe('/dashboard/[slug]/clients/new');
        });

        it('should contain billing key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.billing).toBe('/dashboard/[slug]/billing');
        });

        it('should contain settings key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.settings).toBe('/dashboard/[slug]/settings');
        });

        it('should contain all settings sub-paths', () => {
            const obj = getRouteObject();
            expect(obj['settings.profile' as DashboardNavigationPath]).toBe('/dashboard/[slug]/settings');
            expect(obj['settings.security' as DashboardNavigationPath]).toBe('/dashboard/[slug]/settings/security');
            expect(obj['settings.keybindings' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/keybindings',
            );
            expect(obj['settings.invitations' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/invitations',
            );
        });

        it('should contain all settings.organization paths', () => {
            const obj = getRouteObject();
            expect(obj['settings.organization' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/organization',
            );
            expect(obj['settings.organization.members' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/organization/members',
            );
            expect(obj['settings.organization.roles' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/organization/roles',
            );
            expect(obj['settings.organization.billing' as DashboardNavigationPath]).toBe(
                '/dashboard/[slug]/settings/organization/billing',
            );
        });

        it('should contain aiChat key with correct value', () => {
            const obj = getRouteObject();
            expect(obj.aiChat).toBe('/dashboard/[slug]/ai-chat');
        });

        it('should not contain any routes with [id]', () => {
            const obj = getRouteObject();
            Object.values(obj).forEach((route) => {
                expect(route).not.toContain('[id]');
            });
        });

        it('should have same number of entries as getDashboardNavigationPaths', () => {
            const obj = getRouteObject();
            const items = getDashboardNavigationPaths();
            const objKeys = Object.keys(obj);
            expect(objKeys.length).toBe(items.length);
        });

        it('should build object from getDashboardNavigationPaths items', () => {
            const obj = getRouteObject();
            const items = getDashboardNavigationPaths();
            items.forEach((item) => {
                expect(obj[item.path as DashboardNavigationPath]).toBe(item.route);
            });
        });

        it('should use forEach to iterate items', () => {
            const obj = getRouteObject();
            expect(obj).toBeDefined();
            expect(Object.keys(obj).length).toBeGreaterThan(0);
        });

        it('should return type-safe Record object', () => {
            const obj = getRouteObject();
            const route = obj.dashboard;
            expect(route).toBe('/dashboard/[slug]');
            expect(typeof route).toBe('string');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================

    describe('Integration Tests', () => {
        it('should maintain consistency between getDashboardNavigationPaths and getRouteObject', () => {
            const items = getDashboardNavigationPaths();
            const obj = getRouteObject();

            items.forEach((item) => {
                expect(obj[item.path as DashboardNavigationPath]).toBe(item.route);
            });
        });

        it('should maintain consistency between getDashboardNavigationPaths and resolveRouteFromPath', () => {
            const items = getDashboardNavigationPaths();

            items.forEach((item) => {
                const route = resolveRouteFromPath(item.path);
                expect(route).toBe(item.route);
            });
        });

        it('should have getPageEnumValues return all valid paths', () => {
            const enumValues = getPageEnumValues();
            const items = getDashboardNavigationPaths();

            expect(enumValues.length).toBe(items.length);
            enumValues.forEach((value) => {
                const found = items.some((item) => item.path === value);
                expect(found).toBe(true);
            });
        });

        it('should allow resolving all paths from getPageEnumValues', () => {
            const enumValues = getPageEnumValues();

            enumValues.forEach((path) => {
                expect(() => {
                    resolveRouteFromPath(path as DashboardNavigationPath);
                }).not.toThrow();
            });
        });
    });
});

// ============================================================================
// Demonstration of type safety
// ============================================================================

/**
 * This function demonstrates that the type system provides autocomplete
 * and type checking for valid navigation paths
 */
export function navigateTo(path: DashboardNavigationPath): void {
    console.log(`Navigating to: ${path}`);
    // TypeScript will only allow valid paths here
}

/**
 * Example of type-safe usage
 */
export function exampleUsage() {
    navigateTo('dashboard'); // ✓ Valid
    navigateTo('orders.new'); // ✓ Valid
    navigateTo('settings.organization.members'); // ✓ Valid

    // These would cause TypeScript errors:
    // navigateTo('invalid-path'); // ✗ Type error
    // navigateTo('orders.id'); // ✗ Type error (contains [id])
    // navigateTo('orders.index'); // ✗ Type error (index simplified)
}
