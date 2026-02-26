import { dashboardRoutes } from '@kit/shared/config/routes';
import { generateDescription } from './generate-description';

/**
 * Navigation item with path and route information
 * path: The simplified navigation path (e.g., 'orders.new')
 * route: The actual route template (e.g., '/dashboard/[slug]/orders/new')
 * description: Human-readable description of the navigation path
 */
interface NavigationItem {
    path: DashboardNavigationPath;
    route: DashboardRouteString;
    description: string;
}

/**
 * Type-level utility to extract all navigation paths from the dashboard slug routes
 * This takes the structure of dashboardRoutes.paths.dashboard.slug and returns a union of all valid paths
 *
 * Example: For a structure like:
 * {
 *   index: '/path',
 *   orders: { index: '/path', new: '/path' },
 *   settings: { index: '/path', profile: '/path' }
 * }
 *
 * Returns: 'dashboard' | 'orders' | 'orders.new' | 'settings' | 'settings.profile'
 */

// Helper type for flattening nested paths
type FlattenPaths<T, Prefix extends string = ''> = {
    [K in keyof T]: T[K] extends string
    ? T[K] extends `${string}[id]${string}`
    ? never
    : K extends 'index'
    ? Prefix extends ''
    ? 'dashboard'
    : Prefix
    : Prefix extends ''
    ? K & string
    : `${Prefix}.${K & string}`
    : T[K] extends Record<string, unknown>
    ? FlattenPaths<T[K], Prefix extends '' ? K & string : `${Prefix}.${K & string}`>
    : never;
}[keyof T];

export type ExtractNavigationPaths<T> = T extends Record<string, unknown> ? FlattenPaths<T> : never;

/**
 * Type-level utility to extract all route string values from the dashboard slug routes
 * This recursively extracts all string values (route templates) from the route structure
 *
 * Example: For a structure like:
 * {
 *   index: '/dashboard/[slug]',
 *   orders: { index: '/dashboard/[slug]/orders', new: '/dashboard/[slug]/orders/new' },
 *   settings: { index: '/dashboard/[slug]/settings' }
 * }
 *
 * Returns: '/dashboard/[slug]' | '/dashboard/[slug]/orders' | '/dashboard/[slug]/orders/new' | '/dashboard/[slug]/settings'
 */
type ExtractRouteStrings<T> =
    T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends string
        ? T[K]
        : T[K] extends Record<string, any>
        ? ExtractRouteStrings<T[K]>
        : never;
    }[keyof T]
    : never;

/**
 * Get all dashboard route string values as a type-safe union
 * These are all the actual route templates like '/dashboard/[slug]/orders'
 */
export type DashboardRouteString = ExtractRouteStrings<typeof dashboardRoutes.paths.dashboard.slug>;

/**
 * Get all dashboard navigation paths as a type-safe union
 * Example: 'dashboard' | 'orders' | 'orders.new' | 'products' | 'clients' | 'settings' | ...
 */
export type DashboardNavigationPath = ExtractNavigationPaths<typeof dashboardRoutes.paths.dashboard.slug> | 'index';

/**
 * Extracts all dashboard navigation paths from the routes config
 * Filters out paths containing [id] and simplifies .index suffixes
 */
export function getDashboardNavigationPaths(): NavigationItem[] {
    const items: NavigationItem[] = [];
    const routes = dashboardRoutes.paths.dashboard.slug;

    // Helper function to flatten nested route objects
    function flattenRoutes(obj: any, prefix: string = ''): Array<{ path: string; route: string }> {
        const results: Array<{ path: string; route: string }> = [];

        for (const [key, value] of Object.entries(obj)) {
            const currentPath = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'string') {
                // Skip paths that contain [id]
                if (!value.includes('[id]')) {
                    results.push({
                        path: currentPath,
                        route: value,
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                results.push(...flattenRoutes(value, currentPath));
            }
        }

        return results;
    }

    const flattenedRoutes = flattenRoutes(routes);

    // Process flattened routes and create navigation items
    flattenedRoutes.forEach(({ path, route }) => {
        // Simplify path: remove .index suffix and handle root index
        let simplifiedPath = path;
        if (simplifiedPath === 'index') {
            simplifiedPath = 'dashboard';
        } else if (simplifiedPath.endsWith('.index')) {
            simplifiedPath = simplifiedPath.slice(0, -6);
        }

        const simplifiedPathTyped = simplifiedPath as DashboardNavigationPath;

        items.push({
            path: simplifiedPathTyped,
            route: route as DashboardRouteString,
            description: generateDescription(simplifiedPathTyped),
        });
    });

    return items;
}

/**
 * Get the enum values for the page parameter
 * Returns an array of all valid dashboard navigation paths
 */
export function getPageEnumValues(): DashboardNavigationPath[] {
    return getDashboardNavigationPaths().map((item) => item.path);
}

/**
 * Resolve the full route template from a navigation path
 * @param path - A valid dashboard navigation path
 * @returns The route template with [slug] placeholder (e.g., '/dashboard/[slug]/orders/new')
 * @throws Error if path is not a valid dashboard navigation path
 */
export function resolveRouteFromPath(path: DashboardNavigationPath): DashboardRouteString {
    const items = getDashboardNavigationPaths();
    const item = items.find((i) => i.path === path);

    if (!item) {
        throw new Error(`Unknown navigation path: ${path}`);
    }

    return item.route;
}

/**
 * Get route object for accessing specific paths
 * Returns a mapping of all valid navigation paths to their route templates (with [slug] placeholder)
 */
export function getRouteObject(): Record<DashboardNavigationPath, DashboardRouteString> {
    const items = getDashboardNavigationPaths();
    const routeObj = {} as Record<DashboardNavigationPath, DashboardRouteString>;

    items.forEach((item) => {
        routeObj[item.path] = item.route;
    });

    return routeObj;
}
