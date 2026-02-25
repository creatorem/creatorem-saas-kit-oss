import z from 'zod';

export const settingsOrgSchema = {
    // Organization Settings
    organization_logo_url: {
        schema: z.string().default(''),
        storage: 'organization_attributes',
    },
    organization_name: {
        schema: z.string().default(''),
        storage: 'organization_attributes',
    },
    organization_address: {
        schema: z.string().default(''),
        storage: 'organization_attributes',
    },
    organization_email: {
        schema: z.string().email().nullable().default(null),
        storage: 'organization_attributes',
    },
    organization_website: {
        schema: z.string().default(''),
        storage: 'organization_attributes',
    },
    organization_description: {
        schema: z.string().max(1000).default(''),
        storage: 'organization_settings',
    },
    organization_industry: {
        schema: z.string().default(''),
        storage: 'organization_settings',
    },
    organization_size: {
        schema: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).nullable().default(null),
        storage: 'organization_settings',
    },
    organization_country: {
        schema: z.string().default(''),
        storage: 'organization_settings',
    },
};
