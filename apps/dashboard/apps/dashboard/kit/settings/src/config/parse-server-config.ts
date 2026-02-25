import { z } from 'zod';
import { StorageProvider } from '../shared/server/setting-server-model';

const schema = z.object({
    providers: z.record(z.string(), z.any()),
});

export const parseServerSettingConfig = <
    T extends z.infer<typeof schema> & {
        providers: Record<string, StorageProvider>;
    },
>(
    config: T,
): T => {
    return schema.parse(config) as T;
};
