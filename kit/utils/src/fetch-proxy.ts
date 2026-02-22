import { z } from 'zod';

/**
 * Configuration for a typed API endpoint
 */
export interface ApiEndpointConfig<TParams = any, TResponse = any> {
    /** Zod schema for request parameters (optional) */
    params?: z.ZodType<TParams>;
    /** Zod schema for response validation */
    response: z.ZodType<TResponse>;
}

/**
 * Type-safe API route configuration
 */
export type ApiRoutesConfig = Record<string, ApiEndpointConfig>;

/**
 * Extract parameter type from endpoint config
 */
export type ExtractParams<T extends ApiEndpointConfig> = T['params'] extends z.ZodType
    ? z.infer<T['params']>
    : undefined;

/**
 * Extract response type from endpoint config
 */
export type ExtractResponse<T extends ApiEndpointConfig> = z.infer<T['response']>;

/**
 * Creates a typed fetch proxy function based on API route configuration
 */
export function createFetchProxy<TEndpoints extends ApiRoutesConfig>(endpoints: TEndpoints) {
    return function typedFetch<TKey extends keyof TEndpoints>(
        route: TKey,
        body?: ExtractParams<TEndpoints[TKey]>,
    ): Promise<ExtractResponse<TEndpoints[TKey]>> {
        // Parse route key to extract method and URL
        const routeKey = String(route);
        const [method, ...urlParts] = routeKey.split(':');
        const url = urlParts.join(':');

        const requestInit: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const endpointConfig = endpoints[route];

        if (!endpointConfig) {
            throw new Error(`Endpoint ${String(route)} not found in configuration`);
        }

        // Validate and serialize request body if present and schema exists
        if (
            body !== undefined &&
            endpointConfig.params &&
            (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH')
        ) {
            const validatedBody = endpointConfig.params.parse(body as any);
            requestInit.body = JSON.stringify(validatedBody);
        }

        return fetch(url, requestInit).then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: response.statusText,
                }));

                // Try to validate error response if it matches expected schema
                if (endpointConfig.response.safeParse(errorData).success) {
                    throw new Error(errorData.error || 'Request failed');
                }

                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Validate response using the endpoint's response schema
            const validatedData = endpointConfig.response.parse(data);

            return validatedData;
        });
    } as <TKey extends keyof TEndpoints>(
        route: TKey,
        body?: ExtractParams<TEndpoints[TKey]>,
    ) => Promise<ExtractResponse<TEndpoints[TKey]>>;
}

/**
 * Helper type to create a fully typed fetch function
 */
export type TypedFetchFunction<TEndpoints extends ApiRoutesConfig> = ReturnType<typeof createFetchProxy<TEndpoints>>;
