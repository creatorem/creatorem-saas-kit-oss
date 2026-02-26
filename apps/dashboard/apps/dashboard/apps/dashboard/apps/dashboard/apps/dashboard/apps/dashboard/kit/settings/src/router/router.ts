import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '../shared';
import { getSettingsValuesAction, getSettingsValuesSchema } from './get-settings-values';
import { updateSettingsFormAction, updateSettingsFormSchema } from './update-settings-form';

const ctx = new CtxRouter<{ db: AppClient }>();

export const getSettingsRouter = (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    ctx.router({
        getSettingsValues: ctx.endpoint.input(getSettingsValuesSchema).action(getSettingsValuesAction(schemaConfig)),
        updateSettingsForm: ctx.endpoint.input(updateSettingsFormSchema).action(updateSettingsFormAction(schemaConfig)),
    });
