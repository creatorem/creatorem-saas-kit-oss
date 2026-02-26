import { z } from 'zod';

// Define common link types for better autocompletion
const linkKeys = ['twitter', 'github', 'linkedin', 'discord', 'youtube', 'instagram', 'facebook'] as const;

export type LinkKey = (typeof linkKeys)[number];

const schema = z.object({
    name: z
        .string({
            description: `Name of your application. Ex. "Creatorem"`,
        })
        .min(1),
    /**
     * Used in the html title tag. Ex. "Creatorem | Create your next idea with our professional template kit."
     */
    title: z
        .string({
            description: `Used in the title tag of the page. Ex. "Creatorem | Create your next idea with our professional template kit."`,
        })
        .min(1)
        .max(55, {
            message: `The title must be less than 55 characters.`,
        }),
    /**
     * Used in the meta description tag of the page. Ex. "Creatorem is a platform for creating and managing your projects and ideas."
     */
    description: z
        .string({
            description: `Used in the meta description tag of the page. Ex. "Creatorem is a platform for creating and managing your projects and ideas."`,
        })
        .max(155, {
            message: `The description must be less than 155 characters.`,
        }),
    theme: z.enum(['light', 'dark', 'system']),
    links: z.record(z.enum(linkKeys), z.string().url()).optional(),
    email: z
        .object({
            /**
             * Email template configuration.
             */
            template: z
                .object({
                    logo: z
                        .object({
                            url: z.string().url(),
                            width: z.number(),
                            height: z.number(),
                        })
                        .optional(),
                })
                .optional(),
            /**
             * Contact email for receiving messages from contact forms.
             */
            contactEmail: z.string().email().optional(),
            /**
             * Support email used in email templates.
             */
            supportEmail: z.string().email().optional(),
        })
        .optional(),
});

export type AppConfig = z.infer<typeof schema>;

export const parseAppConfig = (config: AppConfig) => {
    return schema.parse(config);
};
