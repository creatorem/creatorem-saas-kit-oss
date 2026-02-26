import { endpoint } from '@creatorem/next-trpc';
import { client, order, orderStatus, product } from '@kit/drizzle';
import { count, desc, eq } from 'drizzle-orm';
import z from 'zod';

import { logger } from '../../../utils/src/logger';
import { ctx } from './router.ctx';

export const orderRouter = ctx.router({
    archiveOrders: endpoint
        .input(
            z.object({
                page: z.coerce.number(),
                pageSize: z.coerce.number(),
                orgId: z.string(),
            }),
        )
        .action(async ({ page, pageSize, orgId }, { db }) => {
            // Parse pagination parameters from URL with defaults
            const offset = (page - 1) * pageSize;

            // Fetch paginated data with total count
            const [ordersData, totalCountResult] = await db.rls.transaction(async (tx) => {
                const orders = await tx
                    .select({
                        id: order.id,
                        organizationId: order.organizationId,
                        clientId: order.clientId,
                        productId: order.productId,
                        quantity: order.quantity,
                        totalPrice: order.totalPrice,
                        status: order.status,
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt,
                        clientName: client.name,
                        productName: product.name,
                    })
                    .from(order)
                    .leftJoin(client, eq(order.clientId, client.id))
                    .leftJoin(product, eq(order.productId, product.id))
                    .where(eq(order.organizationId, orgId))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(desc(order.createdAt));

                const totalCountResult = await tx.select({ count: count() }).from(order);

                return [orders, totalCountResult];
            });

            const totalCount = totalCountResult[0]?.count || 0;

            return {
                ordersData,
                totalCount,
            };
        }),
    singleOrder: endpoint
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .action(async ({ id }, { db }) => {
            // Fetch the specific order with related client and product data
            const orderData = await db.rls.transaction(async (tx) => {
                const result = await tx
                    .select({
                        order: order,
                        client: client,
                        product: product,
                    })
                    .from(order)
                    .leftJoin(client, eq(order.clientId, client.id))
                    .leftJoin(product, eq(order.productId, product.id))
                    .where(eq(order.id, id));
                return result[0];
            });

            return orderData;
        }),
    createOrder: endpoint
        .input(
            z.object({
                orgId: z.string(),
                data: z.object({
                    clientId: z.string(),
                    productId: z.string(),
                    quantity: z.coerce.number(),
                    totalPrice: z.string(),
                    status: z.enum(orderStatus.enumValues),
                }),
            }),
        )
        .action(async ({ orgId, data }, { db }) => {
            try {
                const orderData = {
                    organizationId: orgId,
                    clientId: data.clientId!,
                    productId: data.productId!,
                    quantity: data.quantity || 1,
                    totalPrice: data.totalPrice || 0,
                    status: data.status || 'pending',
                };

                const [response] = await db.rls.transaction(async (tx) => {
                    return await tx
                        .insert(order)
                        .values(orderData as any)
                        .returning();
                });

                logger.info({ orderData }, 'Order created successfully');
                return response;
            } catch (error) {
                logger.error({ error, data }, 'Failed to create order');
                throw new Error('Failed to create order');
            }
        }),
    updateOrder: endpoint
        .input(
            z.object({
                orderId: z.string(),
                data: z.object({
                    clientId: z.string(),
                    productId: z.string(),
                    quantity: z.coerce.number(),
                    totalPrice: z.string(),
                    status: z.enum(orderStatus.enumValues),
                }),
            }),
        )
        .action(async ({ data: updateData, orderId }, { db }) => {
            try {
                // Remove undefined values
                const filteredData = Object.fromEntries(
                    Object.entries(updateData).filter(([_, value]) => value !== undefined),
                );

                await db.rls.transaction(async (tx) => {
                    await tx.update(order).set(filteredData).where(eq(order.id, orderId));
                });

                logger.info({ orderId, updateData }, 'Order updated successfully');

                return { success: true };
            } catch (error) {
                logger.error({ error, orderId, updateData }, 'Failed to update order');
                return { success: false, error: 'Failed to update order' };
            }
        }),
});
