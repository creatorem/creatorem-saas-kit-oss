import 'server-only';

// import { AsyncFilterCallback, enqueueServerFilter } from '@kit/utils/filters/server';

// const SERVER_REPLACE_LANG_IN_URL = 'serverReplaceLangInUrl';
// const serverReplaceLangInUrl: AsyncFilterCallback<'server_get_url'> = async (url: string): Promise<string> => {
//     // const db = await getDBClient();
//     // const organizationClient = new OrganizationDBClient(db);
//     // const organization = await organizationClient.require();
//     // return replaceSlugInUrl(url, organization.slug);
//     return url.replace('[lang]', lang)
// };

// export default function () {
//     enqueueServerFilter('server_get_url', {
//         name: SERVER_REPLACE_LANG_IN_URL,
//         fn: serverReplaceLangInUrl,
//         async: true,
//     });
// }
