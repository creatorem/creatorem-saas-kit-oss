import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { orgPermission } from '@kit/drizzle';
import type { IconName as RNIconName } from '@kit/native-ui/icon';
import type { toast as rnToast } from '@kit/native-ui/sonner';
import type { IconName as WebIconName } from '@kit/ui/icon';
import type { toast as wwwToast } from '@kit/ui/sonner';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import type { organizationRouter } from '../../router/router';
import { useOrganization } from '../context';
import { type CreateOrganizationRoleInput, createOrganizationRoleSchema } from '../schemas/role-management-schema';

interface OrganizationRole {
    id: string;
    name: string;
    hierarchyLevel: number;
    organizationId: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

// Permission configuration - dynamically created from orgPermission.enumValues
const PERMISSION_CONFIG: Record<string, { label: string; description: string; icon: WebIconName & RNIconName }> = {
    'role.manage': {
        label: 'Manage Roles',
        description: 'Create, update, and delete roles and permissions',
        icon: 'Shield',
    },
    'organization.manage': {
        label: 'Manage Organization',
        description: 'Update organization settings and information',
        icon: 'Store',
    },
    'member.manage': {
        label: 'Manage Members',
        description: 'Add, remove, and update member roles',
        icon: 'Users',
    },
    'invitation.manage': {
        label: 'Manage Invitations',
        description: 'Send and manage organization invitations',
        icon: 'SendHorizontal',
    },
    'setting.manage': {
        label: 'Manage Settings',
        description: 'Update organization-wide settings',
        icon: 'Store',
    },
    'media.manage': {
        label: 'Manage Media',
        description: 'Upload and manage media files',
        icon: 'UploadCloud',
    },
};

// Create PERMISSIONS array from orgPermission.enumValues
export const PERMISSIONS = orgPermission.enumValues
    .filter((value) => PERMISSION_CONFIG[value]) // Only include permissions we have config for
    .map((value) => ({
        value,
        ...PERMISSION_CONFIG[value],
    }));

/**
 * Hook to fetch organization roles on component mount
 * Fetches roles from API and updates organization context
 * Only fetches if organizationRoles is empty
 */
export function useFetchOrganizationRoles(clientTrpc: TrpcClientWithQuery<typeof organizationRouter>) {
    const { organization, organizationRoles, updateOrganizationRoles } = useOrganization();
    const [isLoading, setIsLoading] = useState(true);
    const [, startTransition] = useTransition();

    const fetchRoles = useCallback(() => {
        startTransition(async () => {
            try {
                setIsLoading(true);
                const rolesData = await clientTrpc.getOrganizationRoles.fetch({
                    organizationId: organization.id,
                });
                if (rolesData) {
                    updateOrganizationRoles(rolesData);
                }
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            } finally {
                setIsLoading(false);
            }
        });
    }, [clientTrpc, organization.id, updateOrganizationRoles]);

    useEffect(() => {
        // Only fetch if we don't already have roles or if there are no roles
        if (organizationRoles.length === 0) {
            fetchRoles();
        } else {
            setIsLoading(false);
        }
    }, [organization.id, organizationRoles.length, fetchRoles]);

    return {
        isLoading,
        fetchRoles,
    };
}

/**
 * Hook to manage organization role actions (delete, permissions check, sorting)
 * Handles role deletion with loading states and permission checks
 */
export function useOrganizationRoleActions({
    roles,
    onRolesUpdated,
    clientTrpc,
    toast,
}: {
    roles: OrganizationRole[];
    onRolesUpdated?: () => void;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    toast: typeof rnToast | typeof wwwToast;
}) {
    const { permissions, member, organization } = useOrganization();
    const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Check if user can manage roles
    const canManageRoles = permissions.includes('role.manage') || member.isOwner;

    const handleDeleteRole = useCallback(
        (roleId: string) => {
            startTransition(async () => {
                try {
                    const result = await clientTrpc.deleteOrganizationRole.fetch({
                        organizationId: organization.id,
                        roleId,
                    });

                    if (result?.success) {
                        toast.success('Role deleted successfully');
                        onRolesUpdated?.();
                    } else {
                        throw new Error('Failed to delete role');
                    }
                } catch (error) {
                    console.error('Failed to delete role:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to delete role');
                } finally {
                    setDeletingRoleId(null);
                }
            });
        },
        [clientTrpc, organization.id, onRolesUpdated, toast],
    );

    const createRoleConfirmation = useCallback(
        (role: OrganizationRole) => () => {
            setDeletingRoleId(role.id);
            handleDeleteRole(role.id);
        },
        [handleDeleteRole],
    );

    // Sort roles by hierarchy level (ascending - lowest number first, most important)
    const sortedRoles = useMemo(() => [...roles].sort((a, b) => a.hierarchyLevel - b.hierarchyLevel), [roles]);

    return {
        canManageRoles,
        deletingRoleId,
        isPending,
        handleDeleteRole,
        createRoleConfirmation,
        sortedRoles,
    };
}

/**
 * Hook to manage role permission editing
 * Handles permission selection, toggle, and save operations
 * Includes special handling for role.manage permission
 */
export function useRolePermissionsEditor({
    role,
    onPermissionsUpdated,
    clientTrpc,
    toast,
}: {
    role: OrganizationRole;
    onPermissionsUpdated: () => void;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    toast: typeof rnToast | typeof wwwToast;
}) {
    const [open, setOpen] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);
    const [isPending, startTransition] = useTransition();
    const { organization } = useOrganization();

    const hasMultipleRoleManage = clientTrpc.orgHasMultipleRoleManagePermissions.useQuery({
        input: {
            organizationId: organization.id,
        },
    });

    const handlePermissionToggle = useCallback((permission: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
        );
    }, []);

    const handleSave = useCallback(() => {
        startTransition(async () => {
            try {
                const result = await clientTrpc.updateRolePermissions.fetch({
                    organizationId: role.organizationId,
                    roleId: role.id,
                    permissions: selectedPermissions as any[],
                });

                if ('success' in result) {
                    toast.success('Permissions updated successfully');
                    setOpen(false);
                    onPermissionsUpdated();
                } else {
                    toast.error(result.error);
                }
            } catch (error) {
                console.error('Failed to update permissions:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to update permissions');
            }
        });
    }, [clientTrpc, role, selectedPermissions, onPermissionsUpdated, toast]);

    const hasMultiple = useMemo(() => hasMultipleRoleManage.data?.hasMultiple, [hasMultipleRoleManage]);

    const toggleSelection = useCallback(() => {
        if (selectedPermissions.length === PERMISSIONS.length) {
            setSelectedPermissions(!hasMultiple && role.permissions.includes('role.manage') ? ['role.manage'] : []);
        } else {
            setSelectedPermissions(PERMISSIONS.map((p) => p.value));
        }
    }, [selectedPermissions, hasMultiple, role]);

    return {
        open,
        setOpen,
        selectedPermissions,
        isPending,
        hasMultiple,
        handlePermissionToggle,
        handleSave,
        toggleSelection,
    };
}

/**
 * Hook to manage organization role creation
 * Handles form state, validation, and submission
 */
export function useCreateOrganizationRole({
    organizationId,
    onRoleCreated,
    clientTrpc,
    toast,
}: {
    organizationId: string;
    onRoleCreated: () => void;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    toast: typeof rnToast | typeof wwwToast;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useZodForm({
        schema: createOrganizationRoleSchema,
        defaultValues: {
            organizationId,
            name: '',
            hierarchyLevel: 1,
        },
    });

    const onSubmit = useCallback(
        (values: CreateOrganizationRoleInput) => {
            startTransition(async () => {
                try {
                    const result = await clientTrpc.createOrganizationRole.fetch(values);

                    if (result?.success) {
                        toast.success('Role created successfully');
                        form.reset();
                        setOpen(false);
                        onRoleCreated();
                    } else {
                        throw new Error('Failed to create role');
                    }
                } catch (error) {
                    console.error('Failed to create role:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to create role');
                }
            });
        },
        [clientTrpc, form, onRoleCreated, toast],
    );

    return {
        open,
        setOpen,
        isPending,
        form,
        onSubmit,
    };
}
