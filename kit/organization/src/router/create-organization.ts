import { AppClient } from '@kit/db';
import { and, eq, notification as notificationTable, organization, organizationMember } from '@kit/drizzle';
import z from 'zod';

export const createOrganizationSchema = z.object({
    orgLogoUrl: z.string().optional().nullable(),
    orgName: z.string().min(1, 'Name is required.'),
    orgSlug: z.string().min(3),
});

/**
 * Server action to get organization session data for client-side usage
 * Uses the shared fetchOrganizationSession implementation
 */
export async function createOrganizationAction(
    { orgLogoUrl, orgName, orgSlug }: z.infer<typeof createOrganizationSchema>,
    { db }: { db: AppClient },
) {
    console.log('createOrganizationAction');
    // Start a transaction to create organization and get membership
    try {
        await db.rls.transaction(async (tx) => {
            // do not return, organization trigger will automatically set our owner organization_member once created (for now we cannot access our newly created organization)
            await tx.insert(organization).values({
                name: orgName,
                slug: orgSlug,
                logoUrl: orgLogoUrl,
            });

            const [orgMember] = await tx
                .select()
                .from(organizationMember)
                .rightJoin(organization, eq(organizationMember.organizationId, organization.id))
                .where(and(eq(organizationMember.isOwner, true), eq(organization.slug, orgSlug)))
                .limit(1);

            if (!orgMember) {
                throw new Error('Failed to create organization');
            }

            const newOrgId = orgMember.organization.id;
            const newOrgName = orgMember.organization.name;
            if (!newOrgId) {
                throw new Error('Failed to create organization, organization id not defined.');
            }

            const userId = orgMember.organization_member?.userId;
            if (!userId) {
                throw new Error('Failed to create organization, userId not defined.');
            }

            // Create organization notification
            await tx.insert(notificationTable).values({
                title: `${newOrgName} organization created`,
                body: `You have successfully created the ${newOrgName} organization`,
                userId: userId,
                organizationId: newOrgId,
            });

            return {
                newOrgId,
                newOrgName,
            };
        }); // Transaction commits here: org and membership now visible
    } catch (e) {
        console.error(e);
    }

    // Step 2: Upload logo OUTSIDE transaction (after commit, so RLS can verify membership)
    // if (orgLogoUrl && newOrgId) {
    //     if (!orgLogoUrl.startsWith('data:')) {
    //         throw new Error('Invalid logo format');
    //     }

    //     const matches = orgLogoUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    //     if (!matches || matches.length !== 3) {
    //         throw new Error('Invalid base64 logo');
    //     }

    //     const mimeType = matches[1]!;
    //     const base64Data = matches[2]!;

    //     const buffer = Buffer.from(base64Data, 'base64');

    //     const extension = mimeType.split('/')[1] || 'png';
    //     const timestamp = Date.now();
    //     const fileName = `logo_${timestamp}.${extension}`;
    //     const filePath = `${newOrgId}/${fileName}`; // CRITICAL: Must include orgId for RLS policy

    //     const { data, error } = await db.supabase.storage
    //         .from('organization_media')
    //         .upload(filePath, buffer, {
    //             contentType: mimeType,
    //             upsert: false,
    //         });

    //     if (error) throw error;

    //     // Get the public URL (same as MediaManager does when isUrl={true})
    //     const { data: publicUrlData } = db.supabase.storage
    //         .from('organization_media')
    //         .getPublicUrl(data.path);

    //     // Step 3: Update logoUrl with public URL (not relative path)
    //     await db.rls.transaction(async (tx) => {
    //         await tx
    //             .update(organization)
    //             .set({ logoUrl: publicUrlData.publicUrl })
    //             .where(eq(organization.id, newOrgId));
    //     });
    // }
}
