import 'server-only';

// import { AsyncFilterCallback, enqueueServerFilter } from '@kit/utils/filters/server';

// const SERVER_REPLACE_ORG_IN_URL = 'serverReplaceOrgInUrl';
// const serverReplaceOrgInUrl: AsyncFilterCallback<'server_get_url'> = async (url: string): Promise<string> => {
//     const db = await getDBClient();
//     const organizationClient = new OrganizationDBClient(db);
//     const organization = await organizationClient.require();
//     return replaceSlugInUrl(url, organization.slug);
// };

export default function () {
    // enqueueServerFilter('server_get_url', {
    //     name: SERVER_REPLACE_ORG_IN_URL,
    //     fn: serverReplaceOrgInUrl,
    //     async: true,
    // });
}
