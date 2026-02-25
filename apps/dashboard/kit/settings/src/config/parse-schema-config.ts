import { z } from 'zod';

const schema = z.object({
    schema: z.record(z.string(), z.any()),
});

export type SettingsSchema = z.infer<typeof schema>;

export const parseSchemaSettingConfig = <T extends SettingsSchema>(config: T): T => {
    return schema.parse(config) as T;
};

/* 
import { z } from 'zod';
import { SettingSchemaMap } from '../type';

const schema = z.object({
    id: z.string().min(1),
    schema: z.record(z.string(), z.any()),
});

export type SettingsSchema = Omit<z.infer<typeof schema>, 'schema'> & {
    schema: SettingSchemaMap<string>;
};

export const parseSchemaSettingConfig = <T extends SettingsSchema>(config: T): T => {
    return schema.parse(config) as T;
};

*/
