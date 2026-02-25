import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from '@kit/native-ui/action-sheet';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from '@kit/native-ui/dialog';
// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerHeader,
//     DrawerTitle,
//     DrawerTrigger,
// } from '@kit/native-ui/drawer';
import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Button } from '@kit/native-ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/native-ui/form';
// import { MediaQueries, useMediaQuery } from '@kit/native-ui/hooks/use-media-query';
import { Icon } from '@kit/native-ui/icon';
import { Input } from '@kit/native-ui/input';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { cn } from '@kit/utils';
import React, { useState } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
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
    onSendInvitation: (data: SendInvitationSchema) => Promise<{
        success: boolean;
        invitationId: string;
    }>;
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
                                maxLength={255}
                                variant="classic"
                                placeholder={t('invitations.form.email.placeholder')}
                                disabled={form.formState.isSubmitting}
                                value={field.value}
                                onChangeText={field.onChange}
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
                            <ActionSheetSelect
                                labels={Object.fromEntries([
                                    ...invitableRoles.map((invitation) => [
                                        invitation.id,
                                        invitation.name.charAt(0).toUpperCase() + invitation.name.slice(1),
                                    ]),
                                ])}
                                value={field.value}
                                onValueChange={field.onChange}
                                // disabled={form.formState.isSubmitting}
                            >
                                <ActionSheetSelectTrigger id={`${id}-role-select`}>
                                    <ActionSheetSelectValue placeholder={t('invitations.form.role.placeholder')} />
                                </ActionSheetSelectTrigger>
                                <ActionSheetSelectContent>
                                    {invitableRoles.map((invitation) => (
                                        <ActionSheetSelectItem key={invitation.id} value={invitation.id} />
                                    ))}
                                </ActionSheetSelectContent>
                            </ActionSheetSelect>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </Form>
    );

    const canSubmit = !form.formState.isSubmitting && form.formState.isDirty;

    const renderButtons = (
        <View className="flex flex-row gap-2">
            <Button
                id={`${id}-cancel-button`}
                aria-label={t('invitations.button.cancel')}
                variant="outline"
                className="flex-1"
                onPress={() => setOpen(false)}
            >
                <Text>{t('invitations.button.cancel')}</Text>
            </Button>
            <Button
                id={`${id}-send-button`}
                aria-label={t('invitations.button.sendInvitation')}
                variant="default"
                className="flex-1"
                disabled={!canSubmit}
                loading={form.formState.isSubmitting}
                onPress={form.handleSubmit(onSubmit)}
            >
                <Text>{t('invitations.button.sendInvitation')}</Text>
            </Button>
        </View>
    );

    const triggerButton = iconOnly ? (
        <Button
            id={id}
            variant={variant}
            size={size}
            className={cn('whitespace-nowrap', className)}
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
            aria-label={defaultButtonText}
        >
            {showIcon && <Icon name="User" className="mr-2 size-4" />}
            <Text className="text-foreground">{defaultButtonText}</Text>
        </Button>
    );

    return (
        <ActionSheet open={open} onOpenChange={setOpen}>
            <ActionSheetTrigger asChild>{triggerButton}</ActionSheetTrigger>
            <ActionSheetContent>
                <View className="flex items-start gap-2 px-4">
                    <Text className="text-foreground text-lg font-semibold">{t('invitations.form.title')}</Text>
                    <Text className="text-muted-foreground text-sm">{t('invitations.form.description')}</Text>
                </View>
                <View className="flex gap-4 p-4">{renderForm}</View>
                <View className="p-4">{renderButtons}</View>
            </ActionSheetContent>
        </ActionSheet>
    );
}
