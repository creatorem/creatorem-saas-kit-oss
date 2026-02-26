export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    operationName?: string;
                    query?: string;
                    extensions?: Json;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    kit: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            accept_invitation: {
                Args: { invitation_id: string };
                Returns: string;
            };
            debug_jwt_info: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    jwt_sid: string;
                    auth_user_id: string;
                    jwt_session_id: string;
                    jwt_full: Json;
                    detected_current_session: string;
                    total_user_sessions: number;
                }[];
            };
            get_user_email: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            get_user_id: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            get_user_sessions: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    user_id: string;
                    created_at: string;
                    id: string;
                    updated_at: string;
                    factor_id: string;
                    aal: string;
                    not_after: string;
                    user_agent: string;
                    ip: unknown;
                }[];
            };
            has_multiple_role_manage_permissions: {
                Args: { org_id: string };
                Returns: boolean;
            };
            has_org_permission: {
                Args: {
                    org_id: string;
                    permission_name: Database['public']['Enums']['org_permission'];
                };
                Returns: boolean;
            };
            revoke_all_other_sessions: {
                Args: Record<PropertyKey, never>;
                Returns: number;
            };
            revoke_user_session: {
                Args: { session_id: string };
                Returns: boolean;
            };
            update_session_details: {
                Args: { session_id: string; new_user_agent?: string; new_ip?: unknown };
                Returns: boolean;
            };
            user_is_invited_to_org: {
                Args: { org_id: string };
                Returns: boolean;
            };
            user_is_member_of_org: {
                Args: { org_id: string };
                Returns: boolean;
            };
            user_is_owner_of_org: {
                Args: { org_id: string };
                Returns: boolean;
            };
            user_org_role_is_higher_than: {
                Args: { org_id: string; target_user_id: string };
                Returns: boolean;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            ai_message: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    role: string;
                    thread_id: string;
                    tokens_used: number | null;
                    tool_input: Json | null;
                    tool_name: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    role: string;
                    thread_id: string;
                    tokens_used?: number | null;
                    tool_input?: Json | null;
                    tool_name?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    role?: string;
                    thread_id?: string;
                    tokens_used?: number | null;
                    tool_input?: Json | null;
                    tool_name?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ai_message_thread_id_fkey';
                        columns: ['thread_id'];
                        isOneToOne: false;
                        referencedRelation: 'ai_thread';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'ai_message_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            ai_thread: {
                Row: {
                    created_at: string;
                    external_id: string | null;
                    id: string;
                    metadata: Json;
                    status: Database['public']['Enums']['ai_thread_status'];
                    title: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    external_id?: string | null;
                    id?: string;
                    metadata?: Json;
                    status?: Database['public']['Enums']['ai_thread_status'];
                    title?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    external_id?: string | null;
                    id?: string;
                    metadata?: Json;
                    status?: Database['public']['Enums']['ai_thread_status'];
                    title?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ai_thread_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            ai_usage: {
                Row: {
                    ai_timestamp: string;
                    cached_input_tokens: number;
                    cost: number;
                    created_at: string;
                    id: string;
                    input_tokens: number;
                    model_id: string;
                    output_tokens: number;
                    reasoning_tokens: number;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    ai_timestamp: string;
                    cached_input_tokens?: number;
                    cost?: number;
                    created_at?: string;
                    id?: string;
                    input_tokens?: number;
                    model_id: string;
                    output_tokens?: number;
                    reasoning_tokens?: number;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    ai_timestamp?: string;
                    cached_input_tokens?: number;
                    cost?: number;
                    created_at?: string;
                    id?: string;
                    input_tokens?: number;
                    model_id?: string;
                    output_tokens?: number;
                    reasoning_tokens?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ai_usage_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            ai_wallet: {
                Row: {
                    balance: number;
                    created_at: string;
                    currency: string;
                    id: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    balance?: number;
                    created_at?: string;
                    currency?: string;
                    id?: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    balance?: number;
                    created_at?: string;
                    currency?: string;
                    id?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ai_wallet_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: true;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            ai_wallet_transaction: {
                Row: {
                    amount: number;
                    balance_after: number;
                    created_at: string;
                    description: string | null;
                    id: string;
                    metadata: Json | null;
                    type: string;
                    updated_at: string;
                    user_id: string;
                    wallet_id: string;
                };
                Insert: {
                    amount: number;
                    balance_after: number;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    metadata?: Json | null;
                    type: string;
                    updated_at?: string;
                    user_id: string;
                    wallet_id: string;
                };
                Update: {
                    amount?: number;
                    balance_after?: number;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    metadata?: Json | null;
                    type?: string;
                    updated_at?: string;
                    user_id?: string;
                    wallet_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ai_wallet_transaction_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'ai_wallet_transaction_wallet_id_fkey';
                        columns: ['wallet_id'];
                        isOneToOne: false;
                        referencedRelation: 'ai_wallet';
                        referencedColumns: ['id'];
                    },
                ];
            };
            client: {
                Row: {
                    address: string | null;
                    created_at: string;
                    email: string | null;
                    id: string;
                    name: string;
                    organization_id: string;
                    phone: string | null;
                    updated_at: string;
                };
                Insert: {
                    address?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name: string;
                    organization_id: string;
                    phone?: string | null;
                    updated_at?: string;
                };
                Update: {
                    address?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name?: string;
                    organization_id?: string;
                    phone?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'client_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                ];
            };
            notification: {
                Row: {
                    android_channel_id: string | null;
                    body: string;
                    created_at: string;
                    data: Json | null;
                    icon: string | null;
                    id: string;
                    image_url: string | null;
                    ios_badge_count: number | null;
                    ios_sound_name: string | null;
                    ios_subtitle: string | null;
                    organization_id: string | null;
                    read: boolean;
                    title: string;
                    type: Database['public']['Enums']['notification_type'];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    android_channel_id?: string | null;
                    body: string;
                    created_at?: string;
                    data?: Json | null;
                    icon?: string | null;
                    id?: string;
                    image_url?: string | null;
                    ios_badge_count?: number | null;
                    ios_sound_name?: string | null;
                    ios_subtitle?: string | null;
                    organization_id?: string | null;
                    read?: boolean;
                    title: string;
                    type?: Database['public']['Enums']['notification_type'];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    android_channel_id?: string | null;
                    body?: string;
                    created_at?: string;
                    data?: Json | null;
                    icon?: string | null;
                    id?: string;
                    image_url?: string | null;
                    ios_badge_count?: number | null;
                    ios_sound_name?: string | null;
                    ios_subtitle?: string | null;
                    organization_id?: string | null;
                    read?: boolean;
                    title?: string;
                    type?: Database['public']['Enums']['notification_type'];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'notification_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'notification_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order: {
                Row: {
                    client_id: string;
                    created_at: string;
                    id: string;
                    organization_id: string;
                    product_id: string;
                    quantity: number;
                    status: Database['public']['Enums']['order_status'];
                    total_price: number;
                    updated_at: string;
                };
                Insert: {
                    client_id: string;
                    created_at?: string;
                    id?: string;
                    organization_id: string;
                    product_id: string;
                    quantity: number;
                    status?: Database['public']['Enums']['order_status'];
                    total_price: number;
                    updated_at?: string;
                };
                Update: {
                    client_id?: string;
                    created_at?: string;
                    id?: string;
                    organization_id?: string;
                    product_id?: string;
                    quantity?: number;
                    status?: Database['public']['Enums']['order_status'];
                    total_price?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_client_id_fkey';
                        columns: ['client_id'];
                        isOneToOne: false;
                        referencedRelation: 'client';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'product';
                        referencedColumns: ['id'];
                    },
                ];
            };
            organization: {
                Row: {
                    address: string | null;
                    created_at: string;
                    email: string | null;
                    id: string;
                    logo_url: string | null;
                    name: string;
                    slug: string;
                    updated_at: string;
                    website: string | null;
                };
                Insert: {
                    address?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    logo_url?: string | null;
                    name: string;
                    slug: string;
                    updated_at?: string;
                    website?: string | null;
                };
                Update: {
                    address?: string | null;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    logo_url?: string | null;
                    name?: string;
                    slug?: string;
                    updated_at?: string;
                    website?: string | null;
                };
                Relationships: [];
            };
            organization_invitation: {
                Row: {
                    created_at: string;
                    email: string;
                    expires_at: string;
                    id: string;
                    invite_token: string;
                    invited_by: string;
                    organization_id: string;
                    role_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    email: string;
                    expires_at?: string;
                    id?: string;
                    invite_token?: string;
                    invited_by?: string;
                    organization_id: string;
                    role_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string;
                    expires_at?: string;
                    id?: string;
                    invite_token?: string;
                    invited_by?: string;
                    organization_id?: string;
                    role_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'organization_invitation_invited_by_fkey';
                        columns: ['invited_by'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'organization_invitation_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'organization_invitation_role_id_fkey';
                        columns: ['role_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization_role';
                        referencedColumns: ['id'];
                    },
                ];
            };
            organization_member: {
                Row: {
                    created_at: string;
                    id: string;
                    is_owner: boolean;
                    organization_id: string;
                    role_id: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    is_owner?: boolean;
                    organization_id: string;
                    role_id: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    is_owner?: boolean;
                    organization_id?: string;
                    role_id?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'organization_member_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'organization_member_role_id_fkey';
                        columns: ['role_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization_role';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'organization_member_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            organization_role: {
                Row: {
                    created_at: string;
                    hierarchy_level: number;
                    id: string;
                    name: string;
                    organization_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    hierarchy_level: number;
                    id?: string;
                    name: string;
                    organization_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    hierarchy_level?: number;
                    id?: string;
                    name?: string;
                    organization_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'organization_role_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                ];
            };
            organization_role_permission: {
                Row: {
                    created_at: string;
                    id: string;
                    organization_id: string;
                    permission: Database['public']['Enums']['org_permission'];
                    role_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    organization_id: string;
                    permission: Database['public']['Enums']['org_permission'];
                    role_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    organization_id?: string;
                    permission?: Database['public']['Enums']['org_permission'];
                    role_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'organization_role_permission_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'organization_role_permission_role_id_fkey';
                        columns: ['role_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization_role';
                        referencedColumns: ['id'];
                    },
                ];
            };
            organization_setting: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string;
                    organization_id: string;
                    updated_at: string;
                    value: Json;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    name: string;
                    organization_id: string;
                    updated_at?: string;
                    value?: Json;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string;
                    organization_id?: string;
                    updated_at?: string;
                    value?: Json;
                };
                Relationships: [
                    {
                        foreignKeyName: 'organization_setting_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                ];
            };
            product: {
                Row: {
                    created_at: string;
                    currency: string;
                    description: string | null;
                    id: string;
                    image_url: string | null;
                    name: string;
                    organization_id: string;
                    price: number;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    currency?: string;
                    description?: string | null;
                    id?: string;
                    image_url?: string | null;
                    name: string;
                    organization_id: string;
                    price: number;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    currency?: string;
                    description?: string | null;
                    id?: string;
                    image_url?: string | null;
                    name?: string;
                    organization_id?: string;
                    price?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'product_organization_id_fkey';
                        columns: ['organization_id'];
                        isOneToOne: false;
                        referencedRelation: 'organization';
                        referencedColumns: ['id'];
                    },
                ];
            };
            subscription: {
                Row: {
                    created_at: string;
                    id: string;
                    stripe_subscription_id: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    stripe_subscription_id: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    stripe_subscription_id?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'subscription_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            usage_record: {
                Row: {
                    action_type: string;
                    created_at: string;
                    id: string;
                    subscription_id: string;
                    tokens_used: number;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    action_type: string;
                    created_at?: string;
                    id?: string;
                    subscription_id: string;
                    tokens_used: number;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    action_type?: string;
                    created_at?: string;
                    id?: string;
                    subscription_id?: string;
                    tokens_used?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'usage_record_subscription_id_fkey';
                        columns: ['subscription_id'];
                        isOneToOne: false;
                        referencedRelation: 'subscription';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'usage_record_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
            user: {
                Row: {
                    auth_user_id: string;
                    completed_onboarding: boolean;
                    created_at: string;
                    email: string | null;
                    id: string;
                    name: string;
                    phone: string | null;
                    profile_url: string | null;
                    updated_at: string;
                };
                Insert: {
                    auth_user_id?: string;
                    completed_onboarding?: boolean;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name: string;
                    phone?: string | null;
                    profile_url?: string | null;
                    updated_at?: string;
                };
                Update: {
                    auth_user_id?: string;
                    completed_onboarding?: boolean;
                    created_at?: string;
                    email?: string | null;
                    id?: string;
                    name?: string;
                    phone?: string | null;
                    profile_url?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            user_setting: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string;
                    updated_at: string;
                    user_id: string;
                    value: Json;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    name: string;
                    updated_at?: string;
                    user_id: string;
                    value?: Json;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                    user_id?: string;
                    value?: Json;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_setting_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'user';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            user_org_role_is_higher_than: {
                Args: { target_user_id: string; org_id: string };
                Returns: boolean;
            };
        };
        Enums: {
            ai_thread_status: 'regular' | 'archived';
            notification_type: 'info' | 'warning' | 'error' | 'success';
            order_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
            org_permission:
                | 'role.manage'
                | 'organization.manage'
                | 'member.manage'
                | 'invitation.manage'
                | 'setting.manage'
                | 'media.manage';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    storage: {
        Tables: {
            buckets: {
                Row: {
                    allowed_mime_types: string[] | null;
                    avif_autodetection: boolean | null;
                    created_at: string | null;
                    file_size_limit: number | null;
                    id: string;
                    name: string;
                    owner: string | null;
                    owner_id: string | null;
                    public: boolean | null;
                    updated_at: string | null;
                };
                Insert: {
                    allowed_mime_types?: string[] | null;
                    avif_autodetection?: boolean | null;
                    created_at?: string | null;
                    file_size_limit?: number | null;
                    id: string;
                    name: string;
                    owner?: string | null;
                    owner_id?: string | null;
                    public?: boolean | null;
                    updated_at?: string | null;
                };
                Update: {
                    allowed_mime_types?: string[] | null;
                    avif_autodetection?: boolean | null;
                    created_at?: string | null;
                    file_size_limit?: number | null;
                    id?: string;
                    name?: string;
                    owner?: string | null;
                    owner_id?: string | null;
                    public?: boolean | null;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            migrations: {
                Row: {
                    executed_at: string | null;
                    hash: string;
                    id: number;
                    name: string;
                };
                Insert: {
                    executed_at?: string | null;
                    hash: string;
                    id: number;
                    name: string;
                };
                Update: {
                    executed_at?: string | null;
                    hash?: string;
                    id?: number;
                    name?: string;
                };
                Relationships: [];
            };
            objects: {
                Row: {
                    bucket_id: string | null;
                    created_at: string | null;
                    id: string;
                    last_accessed_at: string | null;
                    level: number | null;
                    metadata: Json | null;
                    name: string | null;
                    owner: string | null;
                    owner_id: string | null;
                    path_tokens: string[] | null;
                    updated_at: string | null;
                    user_metadata: Json | null;
                    version: string | null;
                };
                Insert: {
                    bucket_id?: string | null;
                    created_at?: string | null;
                    id?: string;
                    last_accessed_at?: string | null;
                    level?: number | null;
                    metadata?: Json | null;
                    name?: string | null;
                    owner?: string | null;
                    owner_id?: string | null;
                    path_tokens?: string[] | null;
                    updated_at?: string | null;
                    user_metadata?: Json | null;
                    version?: string | null;
                };
                Update: {
                    bucket_id?: string | null;
                    created_at?: string | null;
                    id?: string;
                    last_accessed_at?: string | null;
                    level?: number | null;
                    metadata?: Json | null;
                    name?: string | null;
                    owner?: string | null;
                    owner_id?: string | null;
                    path_tokens?: string[] | null;
                    updated_at?: string | null;
                    user_metadata?: Json | null;
                    version?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'objects_bucketId_fkey';
                        columns: ['bucket_id'];
                        isOneToOne: false;
                        referencedRelation: 'buckets';
                        referencedColumns: ['id'];
                    },
                ];
            };
            prefixes: {
                Row: {
                    bucket_id: string;
                    created_at: string | null;
                    level: number;
                    name: string;
                    updated_at: string | null;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string | null;
                    level?: number;
                    name: string;
                    updated_at?: string | null;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string | null;
                    level?: number;
                    name?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'prefixes_bucketId_fkey';
                        columns: ['bucket_id'];
                        isOneToOne: false;
                        referencedRelation: 'buckets';
                        referencedColumns: ['id'];
                    },
                ];
            };
            s3_multipart_uploads: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    id: string;
                    in_progress_size: number;
                    key: string;
                    owner_id: string | null;
                    upload_signature: string;
                    user_metadata: Json | null;
                    version: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    id: string;
                    in_progress_size?: number;
                    key: string;
                    owner_id?: string | null;
                    upload_signature: string;
                    user_metadata?: Json | null;
                    version: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    id?: string;
                    in_progress_size?: number;
                    key?: string;
                    owner_id?: string | null;
                    upload_signature?: string;
                    user_metadata?: Json | null;
                    version?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
                        columns: ['bucket_id'];
                        isOneToOne: false;
                        referencedRelation: 'buckets';
                        referencedColumns: ['id'];
                    },
                ];
            };
            s3_multipart_uploads_parts: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    etag: string;
                    id: string;
                    key: string;
                    owner_id: string | null;
                    part_number: number;
                    size: number;
                    upload_id: string;
                    version: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    etag: string;
                    id?: string;
                    key: string;
                    owner_id?: string | null;
                    part_number: number;
                    size?: number;
                    upload_id: string;
                    version: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    etag?: string;
                    id?: string;
                    key?: string;
                    owner_id?: string | null;
                    part_number?: number;
                    size?: number;
                    upload_id?: string;
                    version?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
                        columns: ['bucket_id'];
                        isOneToOne: false;
                        referencedRelation: 'buckets';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
                        columns: ['upload_id'];
                        isOneToOne: false;
                        referencedRelation: 's3_multipart_uploads';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            add_prefixes: {
                Args: { _bucket_id: string; _name: string };
                Returns: undefined;
            };
            can_insert_object: {
                Args: { owner: string; name: string; bucketid: string; metadata: Json };
                Returns: undefined;
            };
            delete_prefix: {
                Args: { _name: string; _bucket_id: string };
                Returns: boolean;
            };
            extension: {
                Args: { name: string };
                Returns: string;
            };
            filename: {
                Args: { name: string };
                Returns: string;
            };
            foldername: {
                Args: { name: string };
                Returns: string[];
            };
            get_level: {
                Args: { name: string };
                Returns: number;
            };
            get_prefix: {
                Args: { name: string };
                Returns: string;
            };
            get_prefixes: {
                Args: { name: string };
                Returns: string[];
            };
            get_size_by_bucket: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    size: number;
                    bucket_id: string;
                }[];
            };
            list_multipart_uploads_with_delimiter: {
                Args: {
                    bucket_id: string;
                    prefix_param: string;
                    delimiter_param: string;
                    max_keys?: number;
                    next_key_token?: string;
                    next_upload_token?: string;
                };
                Returns: {
                    id: string;
                    key: string;
                    created_at: string;
                }[];
            };
            list_objects_with_delimiter: {
                Args: {
                    next_token?: string;
                    start_after?: string;
                    max_keys?: number;
                    delimiter_param: string;
                    bucket_id: string;
                    prefix_param: string;
                };
                Returns: {
                    name: string;
                    updated_at: string;
                    metadata: Json;
                    id: string;
                }[];
            };
            operation: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            search: {
                Args: {
                    sortorder?: string;
                    sortcolumn?: string;
                    search?: string;
                    offsets?: number;
                    levels?: number;
                    limits?: number;
                    bucketname: string;
                    prefix: string;
                };
                Returns: {
                    last_accessed_at: string;
                    created_at: string;
                    updated_at: string;
                    id: string;
                    name: string;
                    metadata: Json;
                }[];
            };
            search_legacy_v1: {
                Args: {
                    levels?: number;
                    bucketname: string;
                    prefix: string;
                    sortorder?: string;
                    sortcolumn?: string;
                    search?: string;
                    offsets?: number;
                    limits?: number;
                };
                Returns: {
                    metadata: Json;
                    last_accessed_at: string;
                    created_at: string;
                    updated_at: string;
                    id: string;
                    name: string;
                }[];
            };
            search_v1_optimised: {
                Args: {
                    prefix: string;
                    sortorder?: string;
                    sortcolumn?: string;
                    search?: string;
                    offsets?: number;
                    levels?: number;
                    limits?: number;
                    bucketname: string;
                };
                Returns: {
                    id: string;
                    created_at: string;
                    last_accessed_at: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
            search_v2: {
                Args: {
                    levels?: number;
                    prefix: string;
                    bucket_name: string;
                    limits?: number;
                    start_after?: string;
                };
                Returns: {
                    key: string;
                    name: string;
                    id: string;
                    updated_at: string;
                    created_at: string;
                    metadata: Json;
                }[];
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes'] | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    kit: {
        Enums: {},
    },
    public: {
        Enums: {
            ai_thread_status: ['regular', 'archived'],
            notification_type: ['info', 'warning', 'error', 'success'],
            order_status: ['pending', 'confirmed', 'completed', 'cancelled'],
            org_permission: [
                'role.manage',
                'organization.manage',
                'member.manage',
                'invitation.manage',
                'setting.manage',
                'media.manage',
            ],
        },
    },
    storage: {
        Enums: {},
    },
} as const;
