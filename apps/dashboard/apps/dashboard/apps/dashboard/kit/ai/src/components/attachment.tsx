'use client';

import {
    AttachmentPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    useAssistantApi,
    useAssistantState,
} from '@assistant-ui/react';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Icon } from '@kit/ui/icon';
import { InputGroupButton } from '@kit/ui/input-group';
import { Tooltip, TooltipContent, TooltipSc, TooltipTrigger } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import Image from 'next/image';
import { type FC, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const useFileSrc = (file: File | undefined) => {
    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!file) {
            setSrc(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setSrc(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return src;
};

const useAttachmentSrc = () => {
    const { file, src } = useAssistantState(
        useShallow(({ attachment }): { file?: File; src?: string } => {
            if (attachment.type !== 'image') return {};
            if (attachment.file) return { file: attachment.file };
            const src = attachment.content?.filter((c) => c.type === 'image')[0]?.image;
            if (!src) return {};
            return { src };
        }),
    );

    return useFileSrc(file) ?? src;
};

type AttachmentPreviewProps = {
    src: string;
};

const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src }) => {
    const { t } = useTranslation('p_ai');
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <Image
            src={src}
            alt={t('imagePreview')}
            width={1}
            height={1}
            className={
                isLoaded
                    ? 'aui-attachment-preview-image-loaded block h-auto max-h-[80vh] w-auto max-w-full object-contain'
                    : 'aui-attachment-preview-image-loading hidden'
            }
            onLoadingComplete={() => setIsLoaded(true)}
            priority={false}
        />
    );
};

const AttachmentPreviewDialog: FC<PropsWithChildren> = ({ children }) => {
    const { t } = useTranslation('p_ai');
    const src = useAttachmentSrc();

    if (!src) return children;

    return (
        <Dialog>
            <DialogTrigger
                className="aui-attachment-preview-trigger hover:bg-accent/50 cursor-pointer transition-colors"
                asChild
            >
                {children}
            </DialogTrigger>
            <DialogContent className="aui-attachment-preview-dialog-content [&_svg]:text-background [&>button]:bg-foreground/60 [&>button]:hover:[&_svg]:text-destructive p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:p-1 [&>button]:opacity-100 [&>button]:!ring-0">
                <DialogTitle className="aui-sr-only sr-only">{t('imageAttachmentPreview')}</DialogTitle>
                <div className="aui-attachment-preview bg-background relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden">
                    <AttachmentPreview src={src} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

const AttachmentThumb: FC = () => {
    const { t } = useTranslation('p_ai');
    const isImage = useAssistantState(({ attachment }) => attachment.type === 'image');
    const src = useAttachmentSrc();

    return (
        <Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
            <AvatarImage src={src} alt={t('attachmentPreview')} className="aui-attachment-tile-image object-cover" />
            <AvatarFallback delayMs={isImage ? 200 : 0}>
                <Icon name="FileText" className="aui-attachment-tile-fallback-icon text-muted-foreground size-8" />
            </AvatarFallback>
        </Avatar>
    );
};

const AttachmentUI: FC = () => {
    const { t } = useTranslation('p_ai');
    const api = useAssistantApi();
    const isComposer = api.attachment.source === 'composer';

    const isImage = useAssistantState(({ attachment }) => attachment.type === 'image');
    const typeLabel = useAssistantState(({ attachment }) => {
        const type = attachment.type;
        switch (type) {
            case 'image':
                return t('image');
            case 'document':
                return t('document');
            case 'file':
                return t('file');
            default: {
                const _exhaustiveCheck: never = type;
                throw new Error(`Unknown attachment type: ${_exhaustiveCheck}`);
            }
        }
    });

    return (
        <Tooltip>
            <AttachmentPrimitive.Root
                className={cn(
                    'aui-attachment-root relative',
                    isImage && 'aui-attachment-root-composer only:[&>#attachment-tile]:size-24',
                )}
            >
                <AttachmentPreviewDialog>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                'aui-attachment-tile bg-muted size-14 cursor-pointer overflow-hidden rounded-[14px] border transition-opacity hover:opacity-75',
                                isComposer && 'aui-attachment-tile-composer border-foreground/20',
                            )}
                            role="button"
                            id="attachment-tile"
                            aria-label={t('attachmentWithType', { type: typeLabel })}
                        >
                            <AttachmentThumb />
                        </div>
                    </TooltipTrigger>
                </AttachmentPreviewDialog>
                {isComposer && <AttachmentRemove />}
            </AttachmentPrimitive.Root>
            <TooltipContent side="top">
                <AttachmentPrimitive.Name />
            </TooltipContent>
        </Tooltip>
    );
};

const AttachmentRemove: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <AttachmentPrimitive.Remove asChild>
            <TooltipSc content={t('removeFile')} side="top">
                <Button
                    className="aui-attachment-tile-remove text-muted-foreground hover:[&_svg]:text-destructive absolute top-1.5 right-1.5 size-3.5 rounded-full bg-white opacity-100 shadow-sm hover:!bg-white [&_svg]:text-black"
                    aria-label={t('removeAttachment')}
                    variant="ghost"
                    size="icon"
                >
                    <Icon name="X" className="aui-attachment-remove-icon size-3 dark:stroke-[2.5px]" />
                </Button>
            </TooltipSc>
        </AttachmentPrimitive.Remove>
    );
};

export const UserMessageAttachments: FC = () => {
    return (
        <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
            <MessagePrimitive.Attachments components={{ Attachment: AttachmentUI }} />
        </div>
    );
};

export const ComposerAttachments: FC = () => {
    return (
        <div className="aui-composer-attachments mb-2 flex w-full flex-row items-center gap-2 overflow-x-auto px-1.5 pt-0.5 pb-1 empty:hidden">
            <ComposerPrimitive.Attachments components={{ Attachment: AttachmentUI }} />
        </div>
    );
};

export const ComposerAddAttachment: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <ComposerPrimitive.AddAttachment asChild>
            <InputGroupButton aria-label={t('addAttachment')} variant="outline" className="rounded-full" size="icon-xs">
                <Icon name="Paperclip" className="size-3.5 -rotate-90" />
            </InputGroupButton>
        </ComposerPrimitive.AddAttachment>
    );
};
