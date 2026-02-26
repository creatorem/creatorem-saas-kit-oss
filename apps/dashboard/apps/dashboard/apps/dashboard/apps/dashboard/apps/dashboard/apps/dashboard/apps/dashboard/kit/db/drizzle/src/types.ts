import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';
import * as schema from './drizzle/schema';

export type DrizzleDB = PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
