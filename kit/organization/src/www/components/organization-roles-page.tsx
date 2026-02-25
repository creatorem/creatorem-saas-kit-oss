'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@kit/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { Skeleton } from '@kit/ui/skeleton';
import { toast } from '@kit/ui/sonner';
import { Muted } from '@kit/ui/text';
import { cn } from '@kit/utils';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('p_org');
    const { open, setOpen, isPending, form, onSubmit } = useCreateOrganizationRole({
        organizationId,
        onRoleCreated,
        clientTrpc,
        toast,
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" aria-label={t('organizationRoles.createNewRoleAria')}>
                    <Icon name="Shield" className="mr-2 h-4 w-4" />
                    {t('organizationRoles.createRole')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('organizationRoles.createNewRole')}</DialogTitle>
                    <DialogDescription>{t('organizationRoles.createRoleDescription')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('organizationRoles.roleName')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('organizationRoles.roleNamePlaceholder')}
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>{t('organizationRoles.roleNameDescription')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hierarchyLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('organizationRoles.hierarchyLevel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                            disabled={isPending}
                                            min={0}
                                            max={10}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('organizationRoles.hierarchyLevelDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                aria-label={t('organizationRoles.cancelRoleCreation')}
                            >
                                {t('organizationRoles.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                aria-label={t('organizationRoles.submitNewRole')}
                            >
                                {isPending ? t('organizationRoles.creating') : t('organizationRoles.createRoleButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
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
    const { t } = useTranslation('p_org');
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('organizationRoles.editPermissionsAria', { roleName: role.name })}
                >
                    <Icon name="Shield" className="mr-2 h-4 w-4" />
                    {t('organizationRoles.permissions')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('organizationRoles.editPermissions', { roleName: role.name })}</DialogTitle>
                    <DialogDescription>{t('organizationRoles.editPermissionsDescription')}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between py-2">
                    <p className="text-muted-foreground text-sm">
                        {t('organizationRoles.permissionsSelected', {
                            count: selectedPermissions.length,
                            total: PERMISSIONS.length,
                        })}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSelection}
                        disabled={isPending || typeof hasMultiple === 'undefined'}
                        aria-label={
                            selectedPermissions.length === PERMISSIONS.length
                                ? t('organizationRoles.deselectAllPermissions')
                                : t('organizationRoles.selectAllPermissions')
                        }
                    >
                        {selectedPermissions.length === PERMISSIONS.length
                            ? t('organizationRoles.deselectAll')
                            : t('organizationRoles.selectAll')}
                    </Button>
                </div>
                <div className="py-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {PERMISSIONS.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.value);
                            const isManageRoleDisabled =
                                role.permissions.includes('role.manage') &&
                                permission.value === 'role.manage' &&
                                hasMultiple === false;

                            return (
                                <div
                                    key={permission.value}
                                    onClick={() =>
                                        !isManageRoleDisabled && !isPending && handlePermissionToggle(permission.value)
                                    }
                                    className={cn(
                                        'relative cursor-pointer rounded-lg border p-4 transition-colors',
                                        isSelected && 'border-primary bg-primary/5',
                                        isPending || isManageRoleDisabled
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:border-primary/50',
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="pt-0.5">
                                            {permission.icon && (
                                                <Icon
                                                    name={permission.icon}
                                                    className={cn(
                                                        'h-5 w-5 transition-colors',
                                                        isSelected ? 'text-primary' : 'text-muted-foreground',
                                                    )}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4
                                                    className={cn(
                                                        'text-sm leading-none font-medium',
                                                        isSelected && 'text-primary',
                                                    )}
                                                >
                                                    {permission.label}
                                                </h4>
                                                <div
                                                    className={cn(
                                                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
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
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm">{permission.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                        aria-label={t('organizationRoles.cancelPermissionChanges')}
                    >
                        {t('organizationRoles.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        aria-label={t('organizationRoles.savePermissions')}
                    >
                        {isPending ? t('organizationRoles.saving') : t('organizationRoles.savePermissions')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function OrganizationRolesManager({ roles, onRolesUpdated, clientTrpc }: OrganizationRolesManagerProps) {
    const { t } = useTranslation('p_org');
    const { organization } = useOrganization();
    const { canManageRoles, deletingRoleId, isPending, createRoleConfirmation, sortedRoles } =
        useOrganizationRoleActions({
            roles,
            onRolesUpdated,
            clientTrpc,
            toast,
        });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Icon name="Shield" className="h-5 w-5" />
                                {t('organizationRoles.title')}
                            </CardTitle>
                            <CardDescription>{t('organizationRoles.description')}</CardDescription>
                        </div>
                        {canManageRoles && (
                            <CreateRoleDialog
                                onRoleCreated={() => onRolesUpdated?.()}
                                organizationId={organization.id}
                                clientTrpc={clientTrpc}
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {sortedRoles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Icon name="Shield" className="text-muted-foreground mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">{t('organizationRoles.noRolesFound')}</h3>
                            <Muted>{t('organizationRoles.noCustomRolesYet')}</Muted>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedRoles.map((role) => {
                                const isDefaultRole = ['editor', 'contributor'].includes(role.name);
                                const isOnlyRole = sortedRoles.length === 1;

                                return (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium capitalize">
                                                    {role.name.replace(/_/g, ' ')}
                                                </span>
                                                <Badge variant="outline">
                                                    {t('organizationRoles.level', {
                                                        level: role.hierarchyLevel,
                                                    })}
                                                </Badge>
                                                {isDefaultRole && (
                                                    <Badge variant="secondary">{t('organizationRoles.default')}</Badge>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {role.permissions.length === 0 ? (
                                                    <Muted className="text-sm">
                                                        {t('organizationRoles.noPermissionsAssigned')}
                                                    </Muted>
                                                ) : (
                                                    role.permissions.map((permission) => {
                                                        const permConfig = PERMISSIONS.find(
                                                            (p) => p.value === permission,
                                                        );
                                                        return (
                                                            <Badge key={permission} variant="secondary">
                                                                {permConfig?.label || permission}
                                                            </Badge>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        {canManageRoles && (
                                            <div className="flex items-center gap-2">
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
                                                        aria-label={t('organizationRoles.deleteRole', {
                                                            roleName: role.name,
                                                        })}
                                                        onConfirmation={createRoleConfirmation(role)}
                                                        header={{
                                                            title: t('organizationRoles.deleteRoleTitle'),
                                                            description: t('organizationRoles.deleteRoleDescription', {
                                                                roleName: role.name,
                                                            }),
                                                        }}
                                                        content={
                                                            <>
                                                                <div className="rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950">
                                                                    <p className="mb-1 font-medium text-amber-900 dark:text-amber-100">
                                                                        <Icon
                                                                            name="AlertCircle"
                                                                            className="mr-1 inline h-4 w-4"
                                                                        />
                                                                        {t('organizationRoles.memberReassignment')}
                                                                    </p>
                                                                    <p className="text-amber-800 dark:text-amber-200">
                                                                        {t(
                                                                            'organizationRoles.memberReassignmentDescription',
                                                                        )}
                                                                    </p>
                                                                    <ol className="mt-2 list-inside list-decimal space-y-1 text-amber-700 dark:text-amber-300">
                                                                        <li>
                                                                            {t('organizationRoles.sameHierarchyLevel')}
                                                                        </li>
                                                                        <li>
                                                                            {t(
                                                                                'organizationRoles.closestHigherAuthority',
                                                                            )}
                                                                        </li>
                                                                        <li>
                                                                            {t(
                                                                                'organizationRoles.closestLowerAuthority',
                                                                            )}
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <p className="text-muted-foreground text-sm">
                                                                    {t('organizationRoles.actionCannotBeUndone')}
                                                                </p>
                                                            </>
                                                        }
                                                        buttonLabels={{
                                                            confirm: t('organizationRoles.deleteRoleButton'),
                                                        }}
                                                    >
                                                        <Icon name="Trash" className="h-4 w-4" />
                                                    </ConfirmButton>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
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
