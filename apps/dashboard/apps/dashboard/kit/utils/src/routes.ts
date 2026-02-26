export function replaceSlugInUrl(route: string, slug: string): string {
    // if (route.indexOf('[slug]') === -1) {
    //     throw new Error(`Invalid route: ${route}. Route must contain the placeholder [slug].`);
    // }

    if (typeof route !== 'string') {
        console.warn({ route });
        throw new Error('route is not a string');
    }

    return route.replace('[slug]', slug);
}
