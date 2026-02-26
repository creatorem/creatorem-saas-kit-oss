import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { createThreadAction, createThreadSchema } from './create-thread';
import { deleteThreadAction, deleteThreadSchema } from './delete-thread';
import { selectThreadsAction, selectThreadsSchema } from './select-threads';
import { updateThreadAction, updateThreadSchema } from './update-thread';

const ctx = new CtxRouter<{ db: AppClient }>();

export const aiRouter = ctx.router({
    // Thread management
    createThread: ctx.endpoint.input(createThreadSchema).action(createThreadAction),
    selectThreads: ctx.endpoint.input(selectThreadsSchema).action(selectThreadsAction),
    updateThread: ctx.endpoint.input(updateThreadSchema).action(updateThreadAction),
    deleteThread: ctx.endpoint.input(deleteThreadSchema).action(deleteThreadAction),
});
