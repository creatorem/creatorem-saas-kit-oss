import 'server-only';

import {
    and,
    eq,
    notification as notificationTable,
    organizationInvitation,
    organization as organizationTable,
    SQL,
    tableSchemaMap,
} from '@kit/drizzle';
import { OrganizationDBClient } from '@kit/organization/shared/server';
import { getDBClient } from '@kit/supabase-server';
import { replaceSlugInUrl } from '@kit/utils';
import { AsyncFilterCallback, enqueueServerFilter, FilterCallback } from '@kit/utils/filters/server';
import { headers } from 'next/headers';
import { OrganizationBilling } from '../../billing/organization-billing';
import { organizationAttributesStorage, organizationSettingsStorage } from '../../shared/organization-setting-provider';
import { settingsOrgSchema } from '../../shared/organization-settings-schema';
import { OrgConfig, wwwConfig } from '../../config';

const SERVER_REPLACE_ORG_IN_URL = 'serverReplaceOrgInUrl';
const serverReplaceOrgInUrl = async (url: string): Promise<string> => {
    const db = await getDBClient();
    const organizationClient = new OrganizationDBClient(db);
    const organization = await organizationClient.require();
    return replaceSlugInUrl(url, organization.slug);
};

const SERVER_ADD_ORGANIZATION_SETTINGS_SCHEMAS = 'serverAddOrganizationSettingsSchemas';
const serverAddOrganizationSettingsSchemas: FilterCallback<'server_get_settings_schema'> = (settingsSchema) => {
    return {
        schema: {
            ...settingsSchema.schema,
            ...settingsOrgSchema,
        },
    };
};

const ADD_ORGANIZATION_SERVER_CONFIG = 'addOrganizationServerConfig';
const addOrganizationServerConfig: FilterCallback<'server_get_settings_server_config'> = (settingsSchema) => {
    return {
        ...settingsSchema,
        providers: {
            ...settingsSchema.providers,
            organization_attributes: organizationAttributesStorage,
            organization_settings: organizationSettingsStorage,
        },
    };
};

/* AUTH PACKAGE */

const PARAMS = {
    INVITE_TOKEN: 'invite_token',
    EMAIL: 'email',
} as const;

const ADD_INVITE_TOKEN_TO_AUTH_NEXT_PATH_CALLBACK = 'addInviteTokenToAuthNextPathCallback';
const addInviteTokenToAuthNextPathCallback: FilterCallback<'server_auth_on_sign_in_redirect_url'> = (
    redirectUrl,
    { searchParams },
) => {
    const inviteToken = searchParams.get(PARAMS.INVITE_TOKEN);

    if (inviteToken) {
        const emailParam = searchParams.get(PARAMS.EMAIL);
        const urlParams = new URLSearchParams({
            [PARAMS.INVITE_TOKEN]: inviteToken,
            [PARAMS.EMAIL]: emailParam ?? '',
        });
        // return `${dashboardRoutes.paths.invitations}?${urlParams.toString()}`;
        return `to implement`;
    }
    return redirectUrl;
};

/* NOTIFICATION PACKAGE */

const ADD_ORG_CONDITION_GETTING_UNREAD_NOTIF = 'addOrgConditionGettingUnreadNotif';
const addOrgConditionGettingUnreadNotif: AsyncFilterCallback<
    'server_notification_select_unread_notif_where_condition'
> = async () => {
    const db = await getDBClient();
    const user = await db.user.require();
    const organizationClient = new OrganizationDBClient(db);
    const organization = await organizationClient.require();

    return and(
        eq(notificationTable.userId, user.id),
        eq(notificationTable.organizationId, organization.id),
        eq(notificationTable.read, false),
    );
};

const ADD_ORG_CONDITION_GETTING_ALL_NOTIFS = 'addOrgConditionGettingAllNotifs';
const addOrgConditionGettingAllNotifs: AsyncFilterCallback<
    'server_notification_select_all_notifs_where_condition'
> = async () => {
    const db = await getDBClient();
    const user = await db.user.require();
    const organizationClient = new OrganizationDBClient(db);
    const organization = await organizationClient.require();

    return and(eq(notificationTable.userId, user.id), eq(notificationTable.organizationId, organization.id));
};

/* CONTENT TYPE PACKAGE */

const ADD_ORG_WHERE_CONDITIONS_FETCHING_CONTENT_TYPES = 'addOrgWhereConditionsFetchingContentTypes';
const addOrgWhereConditionsFetchingContentTypes: AsyncFilterCallback<
    'server_add_where_conditions_fetching_content_types'
> = async (_, { contentType }) => {
    const headersList = await headers();
    console.log({ headersList: headersList.get('x-organization-slug') });
    console.log({ Authorization: headersList.get('Authorization') });
    // const organizationSlug = headersList.get('x-organization-slug');

    const db = await getDBClient();
    const organizationClient = new OrganizationDBClient(db);
    const organization = await organizationClient.require();

    const schema = tableSchemaMap[contentType];

    const whereConditions: SQL[] = [];

    if ('organizationId' in schema) {
        whereConditions.push(eq(schema.organizationId, organization.id));
    }

    return whereConditions;
};

/* BILLING PACKAGE */
const ADD_ORGANIZATION_BILLING_ENTITIES = 'addOrganizationBillingEntities';
const addOrganizationBillingEntities: FilterCallback<'server_get_billing_entities'> = (billingEntities) => {
    return {
        ...billingEntities,
        organization: OrganizationBilling,
    };
};

export default function ({ orgConfig }: { orgConfig: OrgConfig }) {

    const SERVER_HANDLE_ROOT_DASHBOARD_REDIRECTION = 'serverHandleRootDashboardRedirection';
    const serverHandleRootDashboardRedirection: AsyncFilterCallback<'server_redirect_root_dashboard'> = async () => {
        const db = await getDBClient();
        const organizations = await db.rls.transaction(async (tx) => {
            return await tx.select().from(organizationTable);
        });

        if (organizations.length === 1) {
            const organization = organizations[0];
            if (organization) {
                return replaceSlugInUrl(wwwConfig(orgConfig).urls.organizationRoot + '/[slug]', organization.slug);
            }
        }

        return null;
    };

    const SERVER_HANDLE_ONBOARDING_REDIRECTION = 'serverHandleOnboardingRedirection';
    const serverHandleOnboardingRedirection: AsyncFilterCallback<'server_redirect_onboarding'> = async () => {
        const db = await getDBClient();
        const user = await db.user.require();
        const organizationClient = new OrganizationDBClient(db);
        // Check if the user has memberships or pending invitations
        const memberships = await organizationClient.getUserMemberships();
        if (
            // has memberships
            memberships.length > 0 ||
            // pending invitation
            (
                await db.rls.transaction(async (tx) => {
                    const invitations = await tx
                        .select({})
                        .from(organizationInvitation)
                        .where(and(eq(organizationInvitation.email, user.email ?? '')))
                        .limit(1);
                    return invitations;
                })
            ).length > 0
        ) {
            return wwwConfig(orgConfig).urls.onboarding.user;
        }

        return null;
    };


    enqueueServerFilter('server_get_url', {
        name: SERVER_REPLACE_ORG_IN_URL,
        fn: serverReplaceOrgInUrl,
        async: true,
    });

    enqueueServerFilter('server_redirect_root_dashboard', {
        name: SERVER_HANDLE_ROOT_DASHBOARD_REDIRECTION,
        fn: serverHandleRootDashboardRedirection,
        async: true,
    });
    enqueueServerFilter('server_redirect_onboarding', {
        name: SERVER_HANDLE_ONBOARDING_REDIRECTION,
        fn: serverHandleOnboardingRedirection,
        async: true,
    });

    enqueueServerFilter('server_get_settings_schema', {
        name: SERVER_ADD_ORGANIZATION_SETTINGS_SCHEMAS,
        fn: serverAddOrganizationSettingsSchemas,
    });

    enqueueServerFilter('server_get_settings_server_config', {
        name: ADD_ORGANIZATION_SERVER_CONFIG,
        fn: addOrganizationServerConfig,
    });

    /* auth package */
    enqueueServerFilter('server_auth_on_sign_in_redirect_url', {
        name: ADD_INVITE_TOKEN_TO_AUTH_NEXT_PATH_CALLBACK,
        fn: addInviteTokenToAuthNextPathCallback,
    });

    /* notification package */
    enqueueServerFilter('server_notification_select_unread_notif_where_condition', {
        name: ADD_ORG_CONDITION_GETTING_UNREAD_NOTIF,
        fn: addOrgConditionGettingUnreadNotif,
        async: true,
    });

    enqueueServerFilter('server_notification_select_all_notifs_where_condition', {
        name: ADD_ORG_CONDITION_GETTING_ALL_NOTIFS,
        fn: addOrgConditionGettingAllNotifs,
        async: true,
    });

    /* notification package */
    enqueueServerFilter('server_add_where_conditions_fetching_content_types', {
        name: ADD_ORG_WHERE_CONDITIONS_FETCHING_CONTENT_TYPES,
        fn: addOrgWhereConditionsFetchingContentTypes,
        async: true,
    });

    /* billing package */
    enqueueServerFilter('server_get_billing_entities', {
        name: ADD_ORGANIZATION_BILLING_ENTITIES,
        fn: addOrganizationBillingEntities,
    });
}
