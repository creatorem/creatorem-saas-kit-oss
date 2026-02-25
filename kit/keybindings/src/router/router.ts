import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '@kit/settings/shared';
import { deleteKeybindingAction, deleteKeybindingSchema } from './delete-keybinding';
import { getKeybindingsListAction } from './get-keybindings-list';
import { resetKeybindingsAction } from './reset-keybindings';
import { setKeybindingAction, setKeybindingSchema } from './set-keybinding';

const ctx = new CtxRouter<{ db: AppClient }>();

export const getKeybindingsRouter = (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    ctx.router({
        getKeybindingsList: ctx.endpoint.action(getKeybindingsListAction(schemaConfig)),
        setKeybinding: ctx.endpoint.input(setKeybindingSchema).action(setKeybindingAction(schemaConfig)),
        deleteKeybinding: ctx.endpoint.input(deleteKeybindingSchema).action(deleteKeybindingAction(schemaConfig)),
        resetKeybindings: ctx.endpoint.action(resetKeybindingsAction(schemaConfig)),
    });
