import {
    createOrganizationRoleSchema,
    deleteOrganizationRoleSchema,
    updateOrganizationRoleSchema,
    updateRolePermissionsSchema,
} from '../../shared/schemas/role-management-schema';

describe('Role Management Schemas', () => {
    describe('createOrganizationRoleSchema', () => {
        it('should validate valid input', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'test_role',
                hierarchyLevel: 3,
            };

            const result = createOrganizationRoleSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validInput);
            }
        });

        it('should reject empty name', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                name: '',
                hierarchyLevel: 3,
            };

            const result = createOrganizationRoleSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject negative hierarchy level', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'test_role',
                hierarchyLevel: -1,
            };

            const result = createOrganizationRoleSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject hierarchy level above 10', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'test_role',
                hierarchyLevel: 11,
            };

            const result = createOrganizationRoleSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });

    describe('updateOrganizationRoleSchema', () => {
        it('should validate full update', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                name: 'updated_role',
                hierarchyLevel: 5,
            };

            const result = updateOrganizationRoleSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validInput);
            }
        });

        it('should validate partial update with only name', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                name: 'updated_role',
            };

            const result = updateOrganizationRoleSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should validate partial update with only hierarchy', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                hierarchyLevel: 5,
            };

            const result = updateOrganizationRoleSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });
    });

    describe('deleteOrganizationRoleSchema', () => {
        it('should validate valid input', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
            };

            const result = deleteOrganizationRoleSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validInput);
            }
        });

        it('should reject missing roleId', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = deleteOrganizationRoleSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });

    describe('updateRolePermissionsSchema', () => {
        it('should validate valid permissions', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                permissions: ['organization.manage', 'role.manage', 'member.invite'],
            };

            const result = updateRolePermissionsSchema.safeParse(validInput);
            if (!result.success) {
                console.error('Validation error:', result.error.errors);
            }
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validInput);
            }
        });

        it('should validate empty permissions array', () => {
            const validInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                permissions: [],
            };

            const result = updateRolePermissionsSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should reject invalid permissions', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                permissions: ['invalid.permission'],
            };

            const result = updateRolePermissionsSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject non-array permissions', () => {
            const invalidInput = {
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                roleId: '123e4567-e89b-12d3-a456-426614174001',
                permissions: 'not-an-array',
            };

            const result = updateRolePermissionsSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
});
