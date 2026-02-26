'use client';

import { type unstable_RemoteThreadListAdapter as RemoteThreadListAdapter } from '@assistant-ui/react';
import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { toast } from '@kit/ui/sonner';
import { truncate } from '@kit/utils';
import { createAssistantStream } from 'assistant-stream';
import { useCallback, useMemo } from 'react';
import { aiRouter } from '../router/router';

export const useDBThreadAdapter = (clientTrpc: TrpcClientWithQuery<typeof aiRouter>) => {
    const handleList = useCallback<RemoteThreadListAdapter['list']>(async () => {
        try {
            const result = await clientTrpc.selectThreads.fetch({});
            const allThreads = result ?? [];

            return {
                threads: allThreads.map((thread: any) => ({
                    remoteId: thread.id,
                    status: thread.status,
                    title: thread.title,
                    externalId: thread.externalId as string | undefined,
                })),
            };
        } catch (error) {
            console.error('Failed to list threads:', error);
            toast.error('Failed to load threads');
            return { threads: [] };
        }
    }, [clientTrpc]);

    const handleInitialize = useCallback<RemoteThreadListAdapter['initialize']>(
        async (localId) => {
            try {
                console.log('handleInitialize');
                const newThread = await clientTrpc.createThread.fetch({
                    externalId: localId,
                });

                if (!newThread) {
                    throw new Error('Failed to create thread');
                }

                // toast.success('New thread created');

                return {
                    remoteId: newThread.id,
                    externalId: newThread.externalId ?? undefined,
                };
            } catch (error) {
                console.error('Failed to initialize thread:', error);
                toast.error('Failed to create thread');
                throw error;
            }
        },
        [clientTrpc],
    );

    const handleRename = useCallback<RemoteThreadListAdapter['rename']>(
        async (remoteId, title) => {
            try {
                await clientTrpc.updateThread.fetch({
                    threadId: remoteId,
                    title,
                });
                // toast.success('Thread renamed');
            } catch (error) {
                console.error('Failed to rename thread:', error);
                toast.error('Failed to rename thread');
                throw error;
            }
        },
        [clientTrpc],
    );

    const handleArchive = useCallback<RemoteThreadListAdapter['archive']>(
        async (remoteId) => {
            try {
                await clientTrpc.updateThread.fetch({
                    threadId: remoteId,
                    status: 'archived',
                });
                // toast.success('Thread archived');
            } catch (error) {
                console.error('Failed to archive thread:', error);
                toast.error('Failed to archive thread');
                throw error;
            }
        },
        [clientTrpc],
    );

    const handleUnarchive = useCallback<RemoteThreadListAdapter['unarchive']>(
        async (remoteId) => {
            try {
                await clientTrpc.updateThread.fetch({
                    threadId: remoteId,
                    status: 'regular',
                });
                // toast.success('Thread unarchived');
            } catch (error) {
                console.error('Failed to unarchive thread:', error);
                toast.error('Failed to unarchive thread');
                throw error;
            }
        },
        [clientTrpc],
    );

    const handleDelete = useCallback<RemoteThreadListAdapter['delete']>(
        async (remoteId) => {
            try {
                await clientTrpc.deleteThread.fetch({
                    threadId: remoteId,
                });
                // toast.success('Thread deleted');
            } catch (error) {
                console.error('Failed to delete thread:', error);
                toast.error('Failed to delete thread');
                throw error;
            }
        },
        [clientTrpc],
    );

    const generateTitle = useCallback<RemoteThreadListAdapter['generateTitle']>(async (remoteId, messages) => {
        return createAssistantStream(async (controller) => {
            try {
                const firstUserMessage = messages.find((m) => m.role === 'user');
                const firstPrompt = firstUserMessage?.content.find((c) => c.type === 'text')?.text;
                const hint = firstPrompt ? truncate(firstPrompt, { length: 50 }) : 'New Thread';

                controller.appendText(hint);
            } catch (error) {
                console.error('Failed to generate title:', error);
                controller.appendText('Untitled');
            }
        });
    }, []);

    const threadListAdapter = useMemo<RemoteThreadListAdapter>(
        () => ({
            list: handleList,
            initialize: handleInitialize,
            rename: handleRename,
            archive: handleArchive,
            unarchive: handleUnarchive,
            delete: handleDelete,
            generateTitle: generateTitle,
            fetch: async (threadId: string) => {
                // Implement fetch method or return default metadata
                return {
                    id: threadId,
                    remoteId: threadId,
                    title: 'Thread',
                    status: 'regular' as const,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            },
        }),
        [handleList, handleInitialize, handleRename, handleArchive, handleUnarchive, handleDelete, generateTitle],
    );

    return threadListAdapter;
};
