import { getDrizzleSupabaseClient } from '@kit/db';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { logger } from '@kit/utils';
import { OrganizationRolePermissionEngine } from '../../shared/server/organization-role-permission';

// Mock dependencies
jest.mock('@kit/db');
jest.mock('@kit/supabase-server');
jest.mock('@kit/utils', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('OrganizationRolePermissionEngine', () => {
    let service: OrganizationRolePermissionEngine;
    let mockDb: any;
    let mockSupabaseClient: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        mockDb = {
            supabase: {
                rpc: jest.fn(),
            },
            rls: {
                transaction: jest.fn((callback: (tx: any) => Promise<any>) =>
                    callback({
                        select: jest.fn().mockReturnThis(),
                        from: jest.fn().mockReturnThis(),
                        where: jest.fn().mockReturnThis(),
                        delete: jest.fn().mockReturnThis(),
                        insert: jest.fn().mockReturnThis(),
                        values: jest.fn().mockReturnThis(),
                        returning: jest.fn().mockReturnValue([]),
                    }),
                ),
            },
        };

        mockSupabaseClient = {};

        (getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
        (getDrizzleSupabaseClient as jest.Mock).mockResolvedValue(mockDb);

        service = new OrganizationRolePermissionEngine(mockDb as any);
    });

    describe('updateRolePermissions', () => {
        const mockParams = {
            organizationId: 'org-123',
            roleId: 'role-123',
            permissions: ['organization.manage', 'role.manage', 'member.manage'] as any,
            userId: 'user-123',
        } as any;

        it('should update permissions successfully when user has permission', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock transaction
            const mockTransaction = {
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(undefined),
                insert: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([
                    { roleId: 'role-123', permission: 'organization.manage' },
                    { roleId: 'role-123', permission: 'role.manage' },
                    { roleId: 'role-123', permission: 'member.manage' },
                ]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = (await service.updateRolePermissions(mockParams)) as any;

            expect(result.success).toBe(true);
            expect(mockTransaction.delete).toHaveBeenCalled();
            expect(mockTransaction.insert).toHaveBeenCalled();
            expect(mockTransaction.values).toHaveBeenCalledWith([
                { roleId: 'role-123', permission: 'organization.manage' },
                { roleId: 'role-123', permission: 'role.manage' },
                { roleId: 'role-123', permission: 'member.manage' },
            ]);
            expect(logger.info).toHaveBeenCalledWith('Role permissions updated: role-123 by user user-123', {
                permissions: mockParams.permissions,
            });
        });

        it('should fail when user lacks permission', async () => {
            // Mock permission check to return false
            mockDb.supabase.rpc.mockResolvedValue({ data: false });

            const result = (await service.updateRolePermissions(mockParams)) as any;

            expect(result.success).toBe(false);
            expect(result.error).toBe('You do not have permission to manage roles');
            expect(mockDb.rls.transaction).not.toHaveBeenCalled();
        });

        it('should handle empty permissions array', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            const emptyParams = { ...mockParams, permissions: [] };

            // Mock transaction
            const mockTransaction = {
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(undefined),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = (await service.updateRolePermissions(emptyParams)) as any;

            expect(result.success).toBe(true);
            expect(mockTransaction.delete).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('Role permissions updated: role-123 by user user-123', {
                permissions: [],
            });
        });

        it('should handle database errors gracefully', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock database error
            mockDb.rls.transaction.mockRejectedValue(new Error('Database error'));

            const result = (await service.updateRolePermissions(mockParams)) as any;

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
            expect(logger.error).toHaveBeenCalledWith(
                'Failed to update role permissions',
                expect.objectContaining({
                    error: expect.any(Error),
                    params: mockParams,
                }),
            );
        });
    });

    describe('permission validation', () => {
        it('should filter out invalid permissions', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            const paramsWithInvalidPermissions = {
                organizationId: 'org-123',
                roleId: 'role-123',
                permissions: ['organization.manage', 'invalid.permission', 'role.manage'],
                userId: 'user-123',
            };

            // Mock transaction
            const mockTransaction = {
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(undefined),
                insert: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            await service.updateRolePermissions(paramsWithInvalidPermissions as any);

            // Should only insert valid permissions
            expect(mockTransaction.values).toHaveBeenCalledWith([
                { roleId: 'role-123', permission: 'organization.manage' },
                { roleId: 'role-123', permission: 'role.manage' },
            ]);
        });
    });
});
