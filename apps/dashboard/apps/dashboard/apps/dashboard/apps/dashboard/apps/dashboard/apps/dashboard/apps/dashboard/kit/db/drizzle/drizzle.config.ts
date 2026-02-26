import { defineConfig } from 'drizzle-kit';
import { envs } from './envs';

export default defineConfig({
    schema: './src/schema.ts',
    out: './src/drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: envs().SUPABASE_DATABASE_URL,
    },
    schemaFilter: ['public'],
    verbose: true,
    strict: true,
});
