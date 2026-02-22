import { SettingsInputsBase } from '@kit/utils/quick-form';
import { z } from 'zod';
import { SettingSchemaMap, UIConfig } from '../shared';

const schema = z.object({
    ui: z.any().array(),
});

export const parseUISettingConfig = <
    SchemaObj extends SettingSchemaMap<string>,
    Inputs extends SettingsInputsBase,
>(config: {
    ui: UIConfig<SchemaObj, Inputs>;
}) => {
    return schema.parse(config) as unknown as { ui: UIConfig<SchemaObj, Inputs> };
};
