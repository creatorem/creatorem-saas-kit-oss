'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from '@kit/native-ui/action-sheet';
import { Badge } from '@kit/native-ui/badge';
import { Button } from '@kit/native-ui/button';
import { ConfirmButton } from '@kit/native-ui/confirm-button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@kit/native-ui/form';
import { Icon } from '@kit/native-ui/icon';
import { Input } from '@kit/native-ui/input';
import { Section } from '@kit/native-ui/layout/section';
import { Pressable } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { View } from 'react-native';
import { organizationRouter } from '../../router/router';
import { useOrganization } from '../../shared/context';
import {
    PERMISSIONS,
    useCreateOrganizationRole,
    useFetchOrganizationRoles,
    useOrganizationRoleActions,
    useRolePermissionsEditor,
} from '../../shared/hooks/use-organization-roles';

interface OrganizationRole {
    id: string;
    name: string;
    hierarchyLevel: number;
    organizationId: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

interface OrganizationRolesManagerProps {
    roles: OrganizationRole[];
    onRolesUpdated?: () => void;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}

function CreateRoleDialog({
    onRoleCreated,
    organizationId,
    clientTrpc,
}: {
    onRoleCreated: () => void;
    organizationId: string;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}) {
    const { open, setOpen, isPending, form, onSubmit } = useCreateOrganizationRole({
        organizationId,
        onRoleCreated,
        clientTrpc,
        toast,
    });

    return (
        <ActionSheet open={open} onOpenChange={setOpen}>
            <ActionSheetTrigger asChild>
                <Button size="sm" aria-label="Create new role">
                    <Icon name="Shield" className="mr-2 h-4 w-4" size={16} />
                    <Text className="text-foreground">Create Role</Text>
                </Button>
            </ActionSheetTrigger>
            <ActionSheetContent>
                <View className="flex gap-4 px-6">
                    <Section
                        titleSize="xl"
                        className="pt-4"
                        title={`Create new role`}
                        subtitle="Create a new role with a specific hierarchy level. Lower levels have more authority (0 is highest)."
                    />

                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            labelClassName="bg-muted"
                                            placeholder="e.g., moderator"
                                            label="Role name"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            onBlur={field.onBlur}
                                            disabled={isPending || field.disabled}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use lowercase letters, numbers, and underscores only
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hierarchyLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            labelClassName="bg-muted"
                                            disabled={isPending || field.disabled}
                                            value={String(field.value)}
                                            onChangeText={(v) => field.onChange(parseInt(v, 10))}
                                            onBlur={field.onBlur}
                                            label="Hierarchy level"
                                            // min={0}
                                            // max={10}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        0-10, where lower numbers have more authority (0 is highest)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <View className="flex flex-row gap-2">
                            <Button
                                variant="outline"
                                onPress={() => setOpen(false)}
                                disabled={isPending}
                                aria-label="Cancel role creation"
                            >
                                <Text className="text-foreground">Cancel</Text>
                            </Button>
                            <Button
                                disabled={isPending}
                                onPress={form.handleSubmit(onSubmit)}
                                aria-label="Submit new role"
                            >
                                <Text className="text-foreground">{isPending ? 'Creating...' : 'Create Role'}</Text>
                            </Button>
                        </View>
                    </Form>
                </View>
            </ActionSheetContent>
        </ActionSheet>
    );
}

function RolePermissionsDialog({
    role,
    onPermissionsUpdated,
    clientTrpc,
}: {
    role: OrganizationRole;
    onPermissionsUpdated: () => void;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}) {
    const {
        open,
        setOpen,
        selectedPermissions,
        isPending,
        hasMultiple,
        handlePermissionToggle,
        handleSave,
        toggleSelection,
    } = useRolePermissionsEditor({
        role,
        onPermissionsUpdated,
        clientTrpc,
        toast,
    });

    return (
        <ActionSheet open={open} onOpenChange={setOpen}>
            <ActionSheetTrigger asChild>
                <Button variant="outline" size="sm" aria-label={`Edit permissions for ${role.name}`}>
                    <Icon name="Shield" className="mr-2" size={16} />
                    <Text className="text-foreground">Permissions</Text>
                </Button>
            </ActionSheetTrigger>
            <ActionSheetContent>
                <View className="flex gap-4 px-6">
                    <Section
                        titleSize="xl"
                        className="pt-4"
                        title={`Edit Permissions for ${role.name}`}
                        subtitle="Select the permissions this role should have within the organization."
                    />

                    <View className="flex flex-row items-center justify-between py-2">
                        <Text className="text-muted-foreground text-sm">
                            {selectedPermissions.length} of {PERMISSIONS.length} permissions selected
                        </Text>
                        <Button
                            variant="outline"
                            size="sm"
                            onPress={toggleSelection}
                            disabled={isPending || typeof hasMultiple === 'undefined'}
                            aria-label={
                                selectedPermissions.length === PERMISSIONS.length
                                    ? 'Deselect all permissions'
                                    : 'Select all permissions'
                            }
                        >
                            <Text className="text-foreground">
                                {selectedPermissions.length === PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                            </Text>
                        </Button>
                    </View>
                    <View className="flex gap-4">
                        <View className="grid gap-3 sm:grid-cols-2">
                            {PERMISSIONS.map((permission) => {
                                const isSelected = selectedPermissions.includes(permission.value);
                                const isManageRoleDisabled =
                                    role.permissions.includes('role.manage') &&
                                    permission.value === 'role.manage' &&
                                    hasMultiple === false;

                                return (
                                    <Pressable
                                        key={permission.value}
                                        onPress={() =>
                                            !isManageRoleDisabled &&
                                            !isPending &&
                                            handlePermissionToggle(permission.value)
                                        }
                                        className={cn(
                                            'border-border relative cursor-pointer rounded-lg border p-4 transition-colors',
                                            isSelected && 'border-primary bg-primary/20',
                                            isPending || isManageRoleDisabled
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'hover:border-primary/50',
                                        )}
                                    >
                                        <View className="flex flex-row items-start gap-3">
                                            <View className="pt-0.5">
                                                {permission.icon && (
                                                    <Icon
                                                        name={permission.icon}
                                                        className={cn(
                                                            'h-5 w-5 transition-colors',
                                                            isSelected ? 'text-primary' : 'text-muted-foreground',
                                                        )}
                                                    />
                                                )}
                                            </View>
                                            <View className="flex-1 space-y-1">
                                                <View className="flex flex-row items-center justify-between">
                                                    <Text
                                                        className={cn(
                                                            'text-foreground text-sm leading-none font-medium',
                                                            isSelected && 'text-primary',
                                                        )}
                                                    >
                                                        {permission.label}
                                                    </Text>
                                                    <View
                                                        className={cn(
                                                            'border-border flex h-4 w-4 shrink-0 flex-row items-center justify-center rounded-full border transition-all',
                                                            isSelected
                                                                ? 'border-primary bg-primary'
                                                                : 'border-input bg-background',
                                                        )}
                                                    >
                                                        <Icon
                                                            name="Check"
                                                            className={cn(
                                                                'text-primary-foreground h-3 w-3 transition-opacity',
                                                                isSelected ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                            size={12}
                                                        />
                                                    </View>
                                                </View>
                                                <Text className="text-muted-foreground text-sm">
                                                    {permission.description}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                    <View className="flex w-full flex-row gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onPress={() => setOpen(false)}
                            disabled={isPending}
                            aria-label="Cancel permission changes"
                        >
                            <Text className="text-foreground">Cancel</Text>
                        </Button>
                        <Button
                            onPress={handleSave}
                            className="flex-1"
                            disabled={isPending}
                            aria-label="Save permission changes"
                        >
                            <Text className="text-foreground">{isPending ? 'Saving...' : 'Save Permissions'}</Text>
                        </Button>
                    </View>
                </View>
            </ActionSheetContent>
        </ActionSheet>
    );
}

function OrganizationRolesManager({ roles, onRolesUpdated, clientTrpc }: OrganizationRolesManagerProps) {
    const { organization } = useOrganization();
    const { canManageRoles, deletingRoleId, isPending, createRoleConfirmation, sortedRoles } =
        useOrganizationRoleActions({
            roles,
            onRolesUpdated,
            clientTrpc,
            toast,
        });

    return (
        <View>
            <Section
                titleSize="xl"
                className="pb-8"
                // icon="Shield"
                title={`Organization Roles`}
                subtitle="Manage roles and their permissions. Lower hierarchy levels have more authority (0 is highest)."
            />

            {canManageRoles && (
                <CreateRoleDialog
                    onRoleCreated={() => onRolesUpdated?.()}
                    organizationId={organization.id}
                    clientTrpc={clientTrpc}
                />
            )}

            {sortedRoles.length === 0 ? (
                <Empty className="flex-1 pt-4">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="Shield" size={24} />
                        </EmptyMedia>
                        <EmptyTitle>No roles found.</EmptyTitle>
                        <EmptyDescription>Your organization doesn't have any custom roles yet.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <View className="flex gap-4 pt-4">
                    {sortedRoles.map((role) => {
                        const isDefaultRole = ['editor', 'contributor'].includes(role.name);
                        const isOnlyRole = sortedRoles.length === 1;

                        return (
                            <View
                                key={role.id}
                                className="border-border flex items-center justify-between gap-2 rounded-lg border p-4"
                            >
                                <View className="w-full flex-1">
                                    <View className="flex flex-row items-center gap-2">
                                        <Text className="text-foreground text-lg font-semibold capitalize">
                                            {role.name.replace(/_/g, ' ')}
                                        </Text>
                                        <Badge variant="outline">
                                            <Text className="text-foreground">Level {role.hierarchyLevel}</Text>
                                        </Badge>
                                        {isDefaultRole && (
                                            <Badge variant="secondary">
                                                <Text className="text-foreground">Default</Text>
                                            </Badge>
                                        )}
                                    </View>
                                    <View className="mt-2 flex flex-row flex-wrap gap-2">
                                        {role.permissions.length === 0 ? (
                                            <Text className="text-muted-foreground text-sm">
                                                No permissions assigned
                                            </Text>
                                        ) : (
                                            role.permissions.map((permission) => {
                                                const permConfig = PERMISSIONS.find((p) => p.value === permission);
                                                return (
                                                    <Badge key={permission} variant="secondary">
                                                        <Text className="text-foreground">
                                                            {permConfig?.label?.replace('Manage ', '') || permission}
                                                        </Text>
                                                    </Badge>
                                                );
                                            })
                                        )}
                                    </View>
                                </View>

                                {canManageRoles && (
                                    <View className="ml-auto flex flex-row items-center gap-2">
                                        <RolePermissionsDialog
                                            role={role}
                                            onPermissionsUpdated={() => onRolesUpdated?.()}
                                            clientTrpc={clientTrpc}
                                        />

                                        {!isOnlyRole && (
                                            <ConfirmButton
                                                variant="outline"
                                                size="sm"
                                                disabled={isPending && deletingRoleId === role.id}
                                                aria-label={`Delete ${role.name} role`}
                                                onConfirmation={createRoleConfirmation(role)}
                                                header="Delete Role"
                                                content={`Are you sure you want to delete the "${role.name}" role?`}
                                                buttonLabels={{
                                                    confirm: 'Delete Role',
                                                }}
                                            >
                                                <Icon name="Trash" size={16} />
                                            </ConfirmButton>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

export function OrganizationRolesPage({ clientTrpc }: { clientTrpc: TrpcClientWithQuery<typeof organizationRouter> }) {
    const { organizationRoles } = useOrganization();
    const { isLoading, fetchRoles } = useFetchOrganizationRoles(clientTrpc);

    if (isLoading) {
        return <Skeleton className="h-72 w-full" />;
    }

    return <OrganizationRolesManager roles={organizationRoles} onRolesUpdated={fetchRoles} clientTrpc={clientTrpc} />;
}
