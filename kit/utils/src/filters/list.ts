import type { Router } from '@creatorem/next-trpc';
import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { QueryClient } from '@tanstack/react-query';
import type { SQL } from 'drizzle-orm';
import React from 'react';
import type { AnalyticsManager } from '../../../analytics/core/src/types';
import type { AbstractBillingEntity } from '../../../billing/types/src/types/abstract-billing-entity';
import type { AppClient } from '../../../db/core/src/type';
import type { tableSchemaMap } from '../../../db/drizzle/src/tables';
import type { parseKeybindingsConfig } from '../../../keybindings/src/config';
import type { KeybindingActions } from '../../../keybindings/src/types';
import type { SettingsSchema } from '../../../settings/src/config/parse-schema-config';
import type { parseServerSettingConfig } from '../../../settings/src/config/parse-server-config';
import type { parseUISettingConfig } from '../../../settings/src/config/parse-ui-config';
import type { appRouter } from '../../../shared/src/server/router';
import type { QuickFormConfig, QuickFormSchemaMap, QuickFormStepConfig, SettingsInputsBase } from '../quick-form/types';

/**
 * Filter API.
 * Filters can return a value or void.
 */
export interface FilterList {
    checkout_started: {
        priceId: string;
        productId: string;
        return: null;
    };
    user_signed_in: { userId: string; return: null; traits?: Record<string, string> };
    user_signed_up: { method: 'magiclink' | 'password'; return: null };
    user_updated: { userId: string; return: null };
    /**
     * Triggered when `DragAndDrop.draggedNode` is defined during dragging.
     */
    cm_dnd_set_dragged_node: {
        return: [Element, ...Element[]] | null;
    };

    get_url_updater: {
        return: (url: string) => string;
    };

    /**
     * Used in the settings router.
     */
    get_settings_schema: {
        return: SettingsSchema;
    };
    get_settings_ui_config: {
        clientTrpc: TrpcClientWithQuery<Router<unknown>>;
        return: ReturnType<typeof parseUISettingConfig>;
    };
    get_settings_extra_inputs: {
        return: SettingsInputsBase;
    };

    /**
     * Used in the onboarding routes
     */
    on_onboarding_submit: {
        data: Record<string, unknown>;
        clientTrpc: TrpcClientWithQuery<Router<unknown>>;
        queryClient: QueryClient;
        return: string;
        asyncable: true;
    };
    get_onboarding_schema: {
        return: QuickFormSchemaMap;
    };
    get_onboarding_steps_config: {
        clientTrpc: TrpcClientWithQuery<Router<unknown>>;
        return: QuickFormStepConfig<QuickFormSchemaMap>[];
    };
    get_onboarding_extra_inputs: {
        return: SettingsInputsBase;
    };
    render_onboarding_path: {
        onboardingPath: string;
        clientTrpc: TrpcClientWithQuery<Router<unknown>>;
        queryClient: QueryClient;
        defaultSchema: QuickFormSchemaMap;
        defaultSteps: QuickFormStepConfig<QuickFormSchemaMap>[];
        return: null | {
            config: QuickFormConfig<QuickFormSchemaMap>;
            inputs: SettingsInputsBase;
            onSubmit: (data: unknown) => Promise<void>;
        };
    };
    get_trpc_headers: {
        return: HeadersInit;
    };
    /**
     * Triggered on the global-error.tsx nextjs file.
     */
    capture_global_error: {
        error: {
            name: string;
            message: string;
            stack?: string;
            cause?: unknown;
        };
        digest?: string;
        return: null;
    };

    /**
     * Used in mobile app to load translations
     */
    get_translations: {
        language: string;
        namespace: string;
        return: Record<string, string> | null;
        asyncable: true;
    };
    /**
     * Used in mobile app to load translations
     */
    get_namespaces: {
        return: string[];
    };

    /**
     * Used in web app to load translations
     */
    cross_env_get_translations: {
        language: string;
        namespace: string;
        return: Record<string, string> | null;
        asyncable: true;
    };
    /**
     * Used in web app to load translations
     */
    cross_env_get_namespaces: {
        return: string[];
    };

    // from auth package
    auth_on_sign_in_redirect_url: {
        return: string;
    };
    auth_on_sign_up_redirect_url: {
        return: string;
    };
    // from notification package
    notification_get_notification_query_key: {
        return: unknown[];
    };
    server_notification_select_unread_notif_where_condition: {
        return: SQL | undefined;
        asyncable: true;
    };
    server_notification_select_all_notifs_where_condition: {
        return: SQL | undefined;
        asyncable: true;
    };
    // from content type package
    content_type_get_analytics_fetcher_query_key: {
        return: unknown[];
    };
    server_add_where_conditions_fetching_content_types: {
        contentType: keyof typeof tableSchemaMap;
        return: SQL[];
        asyncable: true;
    };
    // from billing package
    server_get_billing_entities: {
        return: Record<string, new (db: AppClient) => AbstractBillingEntity>;
    };

    /**
     * JSX filters
     */
    /**
     * Used at the top left corner on dashboard and mobile apps.
     * Allow to display the organization switcher when the org package is used.
     * @mobile
     * @dashboard
     */
    display_sidebar_logo_name: {
        return: React.ReactNode;
    };
    /**
     * Used at the root of the dashboard endpoint, before the [slug] endpoint.
     * Not used on mobile app.
     * @dashboard
     */
    display_root_dashboard_page: {
        clientTrpc: TrpcClientWithQuery<Router<typeof appRouter>>;
        return: React.ReactNode;
    };
    /**
     * Used in the mobile app on the profile page to add org switcher
     * @mobile
     */
    display_after_profile_image: {
        return: React.ReactNode;
    };
    /**
     * Used to render extra screens in mobile app
     * @mobile
     */
    display_extra_screens: {
        path: string;
        clientTrpc: TrpcClientWithQuery<Router<typeof appRouter>>;
        return: React.ReactNode;
    };

    /**
     * Used in an dashboard ctx, where the user is retrieved and potential organization identified via the `slug` option.
     * Used to add organization provider by the kit/organization package.
     */
    display_trpc_provider_wrapper_in_dashboard: {
        slug: string;
        loader: React.ReactNode;
        clientTrpc: TrpcClientWithQuery<Router<typeof appRouter>>;
        return: React.ReactNode;
    };
    /**
     * Used in an dashboard ctx, where the user and potential organization are retrieved.
     */
    display_trpc_provider_child_in_dashboard: {
        clientTrpc?: TrpcClientWithQuery<Router<typeof appRouter>>;
        url?: (s: string) => string;
        keybindingsModel?: ReturnType<typeof parseKeybindingsConfig>;
        return: React.ReactNode;
    };
    display_app_provider: {
        analytics?: AnalyticsManager;
        return: React.ReactNode;
    };
    /**
     * Used in web app to display potential keybindings shortcut.
     * Useful if the kit/keybindings package is used.
     */
    display_keybinding: {
        actionSlug: keyof KeybindingActions;
        return: React.ReactNode;
    };

    /**
     * Used in web app to display potential keybindings shortcut.
     * Useful if the kit/keybindings package is used.
     */
    get_shortcut: {
        actionSlug: keyof KeybindingActions;
        return: null | {
            shortcut: string | null;
            formattedShortcut: string;
        };
    };

    /**
     * Used in mobile app
     */
    get_dashboard_slug: {
        clientTrpc: TrpcClientWithQuery<Router<unknown>>;
        loadingUI: React.ReactNode;
        return: {
            slug?: string,
            component?: React.ReactNode
        }
    };

    /* SERVER SIDE FILTERS */
    /**
     * Used each time we need to build an url with a "[slug]"
     */
    server_get_url: {
        asyncable: true;
        return: string;
    };
    /**
     * Used in the dashboard root to handle custom redirection pattern.
     */
    server_redirect_root_dashboard: {
        asyncable: true;
        return: string | null;
    };
    /**
     * Used in onboarding root to handle redirection.
     */
    server_redirect_onboarding: {
        return: string | null;
        asyncable: true;
    };
    /**
     * Used in the settings trpc action to get the complete settings schema
     */
    server_get_settings_schema: {
        return: SettingsSchema;
    };
    /**
     * Used in the settings trpc action
     */
    server_get_settings_server_config: {
        return: ReturnType<typeof parseServerSettingConfig>;
    };
    server_auth_on_sign_in_redirect_url: {
        searchParams: URLSearchParams;
        return: string;
    };
}
