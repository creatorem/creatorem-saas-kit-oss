'use client';

import { useOrganization } from '@kit/organization/shared';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@kit/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { MediaQueries, useMediaQuery } from '@kit/ui/hooks/use-media-query';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import React, { useState } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type InvitationFormData, useInvitableRoles } from '../../../shared/hooks/use-invitable-roles';
import { type SendInvitationSchema } from '../../../shared/schemas/invitation/send-invitation-schema';

export interface InvitationButtonProps {
    /**
     * Custom button text. Defaults to "Invite member"
     */
    buttonText?: string;
    /**
     * Button variant
     */
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
    /**
     * Button size
     */
    size?: 'default' | 'sm' | 'lg' | 'icon';
    /**
     * Custom className for the button
     */
    className?: string;
    /**
     * Show icon in button
     */
    showIcon?: boolean;
    /**
     * Icon only mode (no text)
     */
    iconOnly?: boolean;
    /**
     * Callback when invitation is sent successfully
     */
    onInvitationSent?: () => void;
    /**
     * Current user role hierarchy level to determine permissions
     */
    userRoleHierarchyLevel?: number;
    /**
     * Send invitation function (required)
     */
    onSendInvitation: (data: SendInvitationSchema) => Promise<string>;
    /**
     * ID for the trigger button
     */
    id?: string;
}

export function InvitationButton({
    buttonText,
    variant = 'default',
    size = 'default',
    className,
    showIcon = true,
    iconOnly = false,
    onInvitationSent,
    userRoleHierarchyLevel,
    onSendInvitation,
    id = 'invitation-button',
}: InvitationButtonProps): React.JSX.Element {
    const { t } = useTranslation('p_org-settings');
    const [open, setOpen] = useState(false);
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const { organization } = useOrganization();
    const { invitableRoles, form } = useInvitableRoles({ userRoleHierarchyLevel });

    const defaultButtonText = buttonText ?? t('invitations.button.inviteMember');

    const onSubmit: SubmitHandler<InvitationFormData> = async (values) => {
        try {
            const invitationId = await onSendInvitation({
                ...values,
                organizationId: organization.id,
                organizationName: organization.name,
            });

            if (invitationId) {
                toast.success(t('invitations.toast.invitationSentSuccess'));
                form.reset();
                setOpen(false);
                onInvitationSent?.();
            } else {
                toast.error(t('invitations.toast.invitationSentError'));
            }
        } catch (error) {
            console.error('Invitation error:', error);
            toast.error(t('invitations.toast.invitationSentError'));
        }
    };

    const renderForm = (
        <Form {...form}>
            <form className={cn('space-y-4', !mdUp && 'p-4')} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel required htmlFor={`${id}-email-input`}>
                                {t('invitations.form.email.label')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id={`${id}-email-input`}
                                    type="email"
                                    maxLength={255}
                                    placeholder={t('invitations.form.email.placeholder')}
                                    required
                                    disabled={form.formState.isSubmitting}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel required htmlFor={`${id}-role-select`}>
                                {t('invitations.form.role.label')}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    required
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={form.formState.isSubmitting}
                                >
                                    <SelectTrigger id={`${id}-role-select`} className="w-full">
                                        <SelectValue placeholder={t('invitations.form.role.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invitableRoles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id}
                                                id={`${id}-role-option-${role.id}`}
                                            >
                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );

    const canSubmit = !form.formState.isSubmitting && form.formState.isValid;

    const renderButtons = (
        <div className="flex gap-2 pt-4">
            <Button
                id={`${id}-cancel-button`}
                aria-label={t('invitations.button.cancel')}
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
            >
                {t('invitations.button.cancel')}
            </Button>
            <Button
                id={`${id}-send-button`}
                aria-label={t('invitations.button.sendInvitation')}
                type="button"
                variant="default"
                className="flex-1"
                disabled={!canSubmit}
                loading={form.formState.isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
            >
                {t('invitations.button.sendInvitation')}
            </Button>
        </div>
    );

    const triggerButton = iconOnly ? (
        <Button
            id={id}
            variant={variant}
            size={size}
            className={cn('whitespace-nowrap', className)}
            type="button"
            aria-label={defaultButtonText}
        >
            {showIcon && <Icon name="User" className="size-4" />}
        </Button>
    ) : (
        <Button
            id={id}
            variant={variant}
            size={size}
            className={cn('whitespace-nowrap', className)}
            type="button"
            aria-label={defaultButtonText}
        >
            {showIcon && <Icon name="User" className="mr-2 size-4" />}
            {defaultButtonText}
        </Button>
    );

    const title = t('invitations.form.title');
    const description = t('invitations.form.description');

    if (mdUp) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{triggerButton}</DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {renderForm}
                    {renderButtons}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle id={`${id}-drawer-title`}>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                {renderForm}
                <div className="p-4">{renderButtons}</div>
            </DrawerContent>
        </Drawer>
    );
}
