import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { analyticsFetcherSchema, fetchAnalytics } from './analytics-fetcher';
import { bulkDeleteTableEntitiesAction, bulkDeleteTableEntitiesSchema } from './bulk-delete-table-entities';
import { bulkExportTableEntitiesAction, bulkExportTableEntitiesSchema } from './bulk-export-table-entities';
import { searchContentTypeAction, searchContentTypeSchema } from './search-content-type';
import {
    selectContentTypesAction,
    selectContentTypesSchema,
    selectSingleContentTypeAction,
    selectSingleContentTypeSchema,
} from './select-content-type';

const ctx = new CtxRouter<{ db: AppClient }>();

export const contentTypeRouter = ctx.router({
    analyticsFetcher: ctx.endpoint.input(analyticsFetcherSchema).action(async (inputs, { db }) => {
        return await fetchAnalytics(db, inputs);
    }),
    searchContentType: ctx.endpoint.input(searchContentTypeSchema).action(searchContentTypeAction),
    selectSingleContentType: ctx.endpoint.input(selectSingleContentTypeSchema).action(selectSingleContentTypeAction),
    selectContentTypes: ctx.endpoint.input(selectContentTypesSchema).action(selectContentTypesAction),
    bulkDeleteTableEntities: ctx.endpoint.input(bulkDeleteTableEntitiesSchema).action(bulkDeleteTableEntitiesAction),
    bulkExportTableEntities: ctx.endpoint.input(bulkExportTableEntitiesSchema).action(bulkExportTableEntitiesAction),
});
