import { AppClient } from '@kit/db';
import { eq, organization } from '@kit/drizzle';
import { z } from 'zod';

export const checkIfSlugIsAvailableSchema = z.object({
    slug: z
        .string({
            required_error: 'Handle is required.',
            invalid_type_error: 'Handle must be a string.',
        })
        .trim()
        .min(3, 'Minimum 3 characters required.')
        .max(1024, 'Maximum 1024 characters allowed.')
        .regex(/^[a-z0-9]+[a-z0-9_-]*[a-z0-9]+$/, {
            message:
                'Slug must start and end with a letter or number and can contain underscores and hyphens in between.',
        }),
});

export const checkIfSlugIsAvailableAction = async (
    { slug }: z.infer<typeof checkIfSlugIsAvailableSchema>,
    { db }: { db: AppClient },
) => {
    try {
        // Check if an organization with this slug already exists
        const existingOrg = await db.admin.transaction(async (tx) => {
            const existingOrg = await tx.select().from(organization).where(eq(organization.slug, slug)).limit(1);
            return existingOrg;
        });

        return {
            isAvailable: existingOrg.length === 0,
        };
    } catch (error) {
        console.error('Error checking slug availability:', error);
        return {
            serverError: 'Failed to check slug availability',
        };
    }
};
