import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { getSettingsValuesAction, getSettingsValuesSchema } from './get-settings-values';
import { updateSettingsFormAction, updateSettingsFormSchema } from './update-settings-form';

const ctx = new CtxRouter<{ db: AppClient }>();

export const settingsRouter = ctx.router({
        getSettingsValues: ctx.endpoint.input(getSettingsValuesSchema).action(getSettingsValuesAction),
        updateSettingsForm: ctx.endpoint.input(updateSettingsFormSchema).action(updateSettingsFormAction),
    });
