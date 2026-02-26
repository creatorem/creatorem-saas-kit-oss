import { z } from 'zod';

/**
 * Parsing a function with zod breaks it.
 * So we do not pass the resolver function to the config schema.
 */
const i18nConfigSchema = z.object({
    /**
     * The default language to use.
     *
     * @example "en"
     */
    defaultLanguage: z.string(),
    /**
     * The languages to support.
     *
     * @example ["en", "fr"]
     */
    languages: z.array(z.string()),
    /**
     * The namespaces to support.
     *
     * @example ["common", "homepage", "blog", "documentation"]
     */
    namespaces: z.array(z.string()).optional(),
    /**
     * Tell if you want to use page router. /[lang]/...
     *
     * @default false
     */
    useRouting: z.boolean().default(false).optional(),
});

type Resolver = (lang: string, namespace: string) => Promise<Record<string, string>>;

export type I18nConfig = z.infer<typeof i18nConfigSchema> & {
    /**
     * A function that will be used to load the translations for a given language and namespace.
     */
    resolver: Resolver;
};

export const parseI18nConfig = (config: I18nConfig): I18nConfig => {
    const parsedConfig = i18nConfigSchema.parse(config);

    return {
        ...parsedConfig,
        resolver: config.resolver,
    };
};
