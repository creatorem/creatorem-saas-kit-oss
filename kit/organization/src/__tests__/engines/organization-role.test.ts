import { getDrizzleSupabaseClient } from '@kit/db';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { logger } from '@kit/utils';
import { OrganizationRoleEngine } from '../../shared/server/organization-role';

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

describe('OrganizationRoleEngine', () => {
    let service: OrganizationRoleEngine;
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
                        orderBy: jest.fn().mockReturnThis(),
                        limit: jest.fn().mockReturnThis(),
                        insert: jest.fn().mockReturnThis(),
                        update: jest.fn().mockReturnThis(),
                        delete: jest.fn().mockReturnThis(),
                        values: jest.fn().mockReturnThis(),
                        set: jest.fn().mockReturnThis(),
                        returning: jest.fn().mockReturnValue([]),
                        eq: jest.fn(),
                        and: jest.fn(),
                        ne: jest.fn(),
                    }),
                ),
            },
        };

        mockSupabaseClient = {};

        (getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
        (getDrizzleSupabaseClient as jest.Mock).mockResolvedValue(mockDb);

        service = new OrganizationRoleEngine(mockDb as any);
    });

    describe('createRole', () => {
        const mockParams = {
            organizationId: 'org-123',
            name: 'Test Role',
            hierarchyLevel: 3,
            userId: 'user-123',
        };

        it('should create a role successfully when user has permission', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock no existing role
            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([]),
                insert: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([{ id: 'role-123', name: 'Test Role', hierarchyLevel: 3 }]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.createRole(mockParams);

            expect(result.success).toBe(true);
            expect(result.role).toEqual({
                id: 'role-123',
                name: 'Test Role',
                hierarchyLevel: 3,
            });
            expect(logger.info).toHaveBeenCalledWith('Role created: role-123 by user user-123');
        });

        it('should fail when user lacks permission', async () => {
            // Mock permission check to return false
            mockDb.supabase.rpc.mockResolvedValue({ data: false });

            const result = await service.createRole(mockParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('You do not have permission to manage roles');
            expect(mockDb.rls.transaction).not.toHaveBeenCalled();
        });

        it('should fail when role name already exists', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock existing role
            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ id: 'existing-role' }]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.createRole(mockParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('A role with this name already exists');
        });

        it('should handle database errors gracefully', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock database error
            mockDb.rls.transaction.mockRejectedValue(new Error('Database error'));

            const result = await service.createRole(mockParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
            expect(logger.error).toHaveBeenCalledWith(
                'Failed to create role',
                expect.objectContaining({
                    error: expect.any(Error),
                    params: mockParams,
                }),
            );
        });
    });

    describe('updateRole', () => {
        const mockParams = {
            organizationId: 'org-123',
            roleId: 'role-123',
            name: 'Updated Role',
            hierarchyLevel: 4,
            userId: 'user-123',
        };

        it('should update a role successfully when user has permission', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock transaction
            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([{ id: 'role-123', name: 'Updated Role', hierarchyLevel: 4 }]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.updateRole(mockParams);

            expect(result.success).toBe(true);
            expect(result.role).toEqual({
                id: 'role-123',
                name: 'Updated Role',
                hierarchyLevel: 4,
            });
            expect(logger.info).toHaveBeenCalledWith('Role updated: role-123 by user user-123');
        });

        it('should fail when user lacks permission', async () => {
            // Mock permission check to return false
            mockDb.supabase.rpc.mockResolvedValue({ data: false });

            const result = await service.updateRole(mockParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('You do not have permission to manage roles');
        });
    });

    describe('deleteRole', () => {
        const mockParams = {
            organizationId: 'org-123',
            roleId: 'role-123',
            userId: 'user-123',
        };

        it('should delete a role successfully when no members are assigned', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock transaction
            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([]), // No members with this role
                delete: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([{ id: 'role-123' }]),
            };
            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.deleteRole(mockParams);

            expect(result.success).toBe(true);
            expect(logger.info).toHaveBeenCalledWith('Role deleted: role-123 by user user-123');
        });

        it('should reassign members to another role when deleting a role with members', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock transaction with complex scenario
            const mockRoleToDelete = {
                id: 'role-123',
                name: 'editor',
                hierarchyLevel: 3,
                organizationId: 'org-123',
            };
            const mockOtherRoles = [
                mockRoleToDelete,
                { id: 'role-456', name: 'admin', hierarchyLevel: 1, organizationId: 'org-123' },
                { id: 'role-789', name: 'viewer', hierarchyLevel: 5, organizationId: 'org-123' },
            ];
            const mockMembers = [
                { id: 'member-1', roleId: 'role-123' },
                { id: 'member-2', roleId: 'role-123' },
            ];

            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockImplementation((condition) => {
                    // Different behavior based on what we're querying
                    return {
                        select: jest.fn().mockReturnThis(),
                        from: jest.fn().mockReturnThis(),
                        where: jest.fn().mockReturnThis(),
                        limit: jest.fn().mockImplementation((n) => {
                            if (n === 1) {
                                return Promise.resolve([mockRoleToDelete]);
                            }
                            return Promise.resolve(mockOtherRoles);
                        }),
                        // For member query
                        then: (resolve: (value: any) => void) => resolve(mockMembers),
                    };
                }),
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([mockRoleToDelete]),
            };

            // Special handling for the all roles query
            let callCount = 0;
            mockTransaction.where.mockImplementation((condition) => {
                callCount++;
                if (callCount === 2) {
                    // Second call is for all org roles
                    return Promise.resolve(mockOtherRoles);
                }
                if (callCount === 3) {
                    // Third call is for members with role
                    return Promise.resolve(mockMembers);
                }
                return mockTransaction;
            });

            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.deleteRole(mockParams);

            expect(result.success).toBe(true);
            expect(mockTransaction.update).toHaveBeenCalled();
            expect(mockTransaction.delete).toHaveBeenCalled();
        });

        it('should fail when trying to delete the last role', async () => {
            // Mock permission check
            mockDb.supabase.rpc.mockResolvedValue({ data: true });

            // Mock transaction with only one role
            const mockTransaction = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockImplementation(() => ({
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([{ id: 'role-123' }]),
                    then: (resolve: (value: any) => void) => resolve([{ id: 'role-123' }]), // Only one role
                })),
            };

            let callCount = 0;
            mockTransaction.where.mockImplementation(() => {
                callCount++;
                if (callCount === 2) {
                    // Second call is for all org roles
                    return Promise.resolve([{ id: 'role-123' }]); // Only one role
                }
                return mockTransaction;
            });

            mockDb.rls.transaction.mockImplementation((callback: (tx: any) => Promise<any>) =>
                callback(mockTransaction),
            );

            const result = await service.deleteRole(mockParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Cannot delete the last role in an organization');
        });
    });
});
