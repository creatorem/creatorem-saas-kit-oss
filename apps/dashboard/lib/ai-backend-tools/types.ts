import { z } from 'zod';

// Common tool result type
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

// Tool options passed to all tools
export interface ToolOptions {
    getUrl: (u: string) => Promise<string>;
}

// Booking types for AI tools (aligned with database schema)
export const BookingTypeSchema = z.enum(['consultation', 'service', 'appointment', 'reservation']);
export const BookingStatusSchema = z.enum(['confirmed', 'cancelled', 'completed']);

export const CreateBookingSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: BookingTypeSchema.default('appointment'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email('Valid email is required'),
    customerPhone: z.string().optional(),
    customerNotes: z.string().optional(),
    startDate: z.string().datetime('Valid start date is required'),
    endDate: z.string().datetime('Valid end date is required'),
    location: z.string().optional(),
    isOnline: z.boolean().default(false),
    meetingLink: z.string().url().optional(),
    price: z.number().optional(),
    currency: z.string().default('USD'),
    isPaid: z.boolean().default(false),
});

export const UpdateBookingSchema = z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    title: z.string().optional(),
    description: z.string().optional(),
    type: BookingTypeSchema.optional(),
    status: BookingStatusSchema.optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    customerNotes: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z.string().optional(),
    isOnline: z.boolean().optional(),
    meetingLink: z.string().url().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    isPaid: z.boolean().optional(),
});

export const AnalyticsQuerySchema = z.object({
    startDate: z.string().datetime('Valid start date is required'),
    endDate: z.string().datetime('Valid end date is required'),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

export type CreateBookingParams = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingParams = z.infer<typeof UpdateBookingSchema>;
export type AnalyticsQueryParams = z.infer<typeof AnalyticsQuerySchema>;
