import { z } from 'zod';

const nativeSchema = z.object({
    /**
     * The environment for the auth configuration.
     */
    environment: z.literal('native'),
    urls: z.object({
        organizationRoot: z.string({
            description: 'Url to the organization root path, ex: "my-website.com/en/dashboard/" . In this example, urls will be: "my-website.com/en/dashboard/[active-org-slug]"',
        }),
    }),
})

const wwwSchema = z.object({
    /**
     * The environment for the auth configuration.
    */
    environment: z.literal('www'),
    urls: z.object({
        organizationRoot: z.string({
            description: 'Url to the organization root path, ex: "my-website.com/en/dashboard/" . In this example, urls will be: "my-website.com/en/dashboard/[active-org-slug]"',
        }),
        onboarding: z.object({
            index: z.string({
                description: "Onboarding route",
            }),
            user: z.string({
                description: "User onboarding route",
            }),
        })
    }),
})

const schema = z.discriminatedUnion('environment', [
    nativeSchema,
    wwwSchema,
]);

export type OrgConfig = z.infer<typeof schema>;

export const wwwConfig = (c: OrgConfig): z.infer<typeof wwwSchema> => {
    if (c.environment !== 'www') {
        throw new Error('www config required.')
    }
    return c as unknown as z.infer<typeof wwwSchema>
}

export const nativeConfig = (c: OrgConfig): z.infer<typeof nativeSchema> => {
    if (c.environment !== 'native') {
        throw new Error('native config required.')
    }
    return c as unknown as z.infer<typeof nativeSchema>
}

export const parseOrgConfig = (config: OrgConfig) => {
    return schema.parse({ ...config }) as OrgConfig;
};
