import { createOrganizationRoleAction } from '../../router/create-organization-role';
import { OrganizationRoleEngine } from '../../shared/server/organization-role';

// Mock the service
jest.mock('../../shared/server/organization-role');

// Mock next-safe-action dependencies
jest.mock('@kit/auth/next', () => ({
    authActionClient: {
        metadata: jest.fn().mockReturnThis(),
        schema: jest.fn().mockReturnThis(),
        action: jest.fn((handler) => handler),
    },
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

describe('createOrganizationRoleAction action', () => {
    let mockCreateRole: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock implementation
        mockCreateRole = jest.fn();
        (OrganizationRoleEngine as any).mockImplementation(() => ({
            createRole: mockCreateRole,
        }));
    });

    it('should create a role successfully', async () => {
        const mockRole = {
            id: 'role-123',
            name: 'Test Role',
            hierarchyLevel: 3,
            organizationId: 'org-123',
        };

        mockCreateRole.mockResolvedValue({
            success: true,
            role: mockRole,
        });

        const mockContext = {
            ctx: {
                db: {
                    user: {
                        require: jest.fn().mockResolvedValue({ id: 'user-123' }),
                    },
                },
            },
            parsedInput: {
                organizationId: 'org-123',
                name: 'Test Role',
                hierarchyLevel: 3,
            },
        };

        const result = await createOrganizationRoleAction(mockContext.parsedInput as any, mockContext.ctx as any);

        expect(mockCreateRole).toHaveBeenCalledWith({
            organizationId: 'org-123',
            name: 'Test Role',
            hierarchyLevel: 3,
            userId: 'user-123',
        });

        expect(result).toEqual({
            success: true,
            role: mockRole,
        });
    });

    it('should throw error when creation fails', async () => {
        mockCreateRole.mockResolvedValue({
            success: false,
            error: 'Permission denied',
        });

        const mockContext = {
            ctx: {
                db: {
                    user: {
                        require: jest.fn().mockResolvedValue({ id: 'user-123' }),
                    },
                },
            },
            parsedInput: {
                organizationId: 'org-123',
                name: 'Test Role',
                hierarchyLevel: 3,
            },
        };

        await expect(
            createOrganizationRoleAction(mockContext.parsedInput as any, mockContext.ctx as any),
        ).rejects.toThrow('Permission denied');
    });
});
