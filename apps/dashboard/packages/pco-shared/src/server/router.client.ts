import { endpoint } from '@creatorem/next-trpc';
import { client } from '@kit/drizzle';
import { count, desc, eq } from 'drizzle-orm';
import z from 'zod';

import { logger } from '@kit/utils';
import { ctx } from './router.ctx';

export const clientRouter = ctx.router({
    archiveClients: endpoint
        .input(
            z.object({
                page: z.coerce.number(),
                pageSize: z.coerce.number(),
                orgId: z.string(),
            }),
        )
        .action(async ({ page, pageSize, orgId }, { db }) => {
            const offset = (page - 1) * pageSize;

            const [clientsData, totalCountResult] = await db.rls.transaction(async (tx) => {
                const clients = await tx
                    .select()
                    .from(client)
                    .where(eq(client.organizationId, orgId))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(desc(client.createdAt));

                const totalCountResult = await tx.select({ count: count() }).from(client);

                return [clients, totalCountResult];
            });

            const totalCount = totalCountResult[0]?.count || 0;

            return {
                clientsData,
                totalCount,
            };
        }),
    singleClient: endpoint
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .action(async ({ id }, { db }) => {
            const clientData = await db.rls.transaction(async (tx) => {
                const result = await tx.select().from(client).where(eq(client.id, id));
                return result[0];
            });

            return clientData;
        }),
    createClient: endpoint
        .input(
            z.object({
                data: z.object({
                    name: z.string(),
                    email: z.string().optional(),
                    phone: z.string().optional(),
                    address: z.string().optional(),
                }),
                orgId: z.string(),
            }),
        )
        .action(async ({ orgId, data }, { db }) => {
            try {
                const clientData = {
                    organizationId: orgId,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                };

                const [response] = await db.rls.transaction(async (tx) => {
                    return await tx
                        .insert(client)
                        .values(clientData as any)
                        .returning();
                });

                logger.info({ clientData }, 'Client created successfully');
                return response;
            } catch (error) {
                logger.error({ error, data }, 'Failed to create client');
                throw new Error('Failed to create client');
            }
        }),
    updateClient: endpoint
        .input(
            z.object({
                clientId: z.string(),
                data: z.object({
                    name: z.string().optional(),
                    email: z.string().optional(),
                    phone: z.string().optional(),
                    address: z.string().optional(),
                }),
            }),
        )
        .action(async ({ data: updateData, clientId }, { db }) => {
            try {
                const filteredData = Object.fromEntries(
                    Object.entries(updateData).filter(([_, value]) => value !== undefined),
                );

                await db.rls.transaction(async (tx) => {
                    await tx.update(client).set(filteredData).where(eq(client.id, clientId));
                });

                logger.info({ clientId, updateData }, 'Client updated successfully');
                return { success: true };
            } catch (error) {
                logger.error({ error, clientId, updateData }, 'Failed to update client');
                return { success: false, error: 'Failed to update client' };
            }
        }),
});
