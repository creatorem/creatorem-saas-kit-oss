'use client';

import { ThreadListItemPrimitive, ThreadListPrimitive, useAssistantState } from '@assistant-ui/react';
import { Button } from '@kit/ui/button';
import { Skeleton } from '@kit/ui/skeleton';
import { TooltipSc } from '@kit/ui/tooltip';
import { ArchiveIcon, PlusIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const ThreadList: FC = () => {
    return (
        <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
            <ThreadListNew />
            <ThreadListItems />
        </ThreadListPrimitive.Root>
    );
};

const ThreadListNew: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <ThreadListPrimitive.New asChild>
            <Button
                aria-label={t('newThread')}
                className="aui-thread-list-new hover:bg-muted data-active:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start"
                variant="ghost"
            >
                <PlusIcon />
                {t('newThread')}
            </Button>
        </ThreadListPrimitive.New>
    );
};

const ThreadListItems: FC = () => {
    const isLoading = useAssistantState(({ threads }) => threads.isLoading);

    if (isLoading) {
        return <ThreadListSkeleton />;
    }

    return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListSkeleton: FC = () => {
    return (
        <>
            {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                    key={i}
                    shimmerBorder
                    className="h-10 flex-grow rounded-lg"
                    shimmerBorderClassName="rounded-lg [--shimmer-start-x:-100px] [--shimmer-width:120px]"
                    style={{ animationDelay: `${i * 0.025}s` }}
                />
            ))}
        </>
    );
};

const ThreadListItem: FC = () => {
    return (
        <ThreadListItemPrimitive.Root className="aui-thread-list-item hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring data-active:bg-muted flex items-center gap-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:outline-none">
            <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start">
                <ThreadListItemTitle />
            </ThreadListItemPrimitive.Trigger>
            <ThreadListItemArchive />
        </ThreadListItemPrimitive.Root>
    );
};

const ThreadListItemTitle: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <span className="aui-thread-list-item-title text-sm">
            <ThreadListItemPrimitive.Title fallback={t('newChat')} />
        </span>
    );
};

const ThreadListItemArchive: FC = () => {
    const { t } = useTranslation('p_ai');
    return (
        <ThreadListItemPrimitive.Archive asChild>
            <TooltipSc content={t('archiveThread')} side="bottom">
                <Button
                    className="aui-thread-list-item-archive text-foreground hover:text-primary mr-3 ml-auto size-4 p-0"
                    variant="ghost"
                    size="icon"
                    aria-label={t('archiveThread')}
                >
                    <ArchiveIcon />
                </Button>
            </TooltipSc>
        </ThreadListItemPrimitive.Archive>
    );
};
