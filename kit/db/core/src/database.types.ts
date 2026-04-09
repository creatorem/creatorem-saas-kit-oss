export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  kit: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_id: string }
        Returns: string
      }
      debug_jwt_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          jwt_session_id: string
          auth_user_id: string
          total_user_sessions: number
          detected_current_session: string
          jwt_full: Json
          jwt_sid: string
        }[]
      }
      get_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          factor_id: string
          updated_at: string
          created_at: string
          id: string
          ip: unknown
          user_agent: string
          not_after: string
          aal: string
        }[]
      }
      has_multiple_member_manage_permissions: {
        Args: { org_id: string }
        Returns: boolean
      }
      has_org_permission: {
        Args: {
          org_id: string
          permission_name: Database["public"]["Enums"]["org_permission"]
        }
        Returns: boolean
      }
      revoke_all_other_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      revoke_user_session: {
        Args: { session_id: string }
        Returns: boolean
      }
      update_session_details: {
        Args: { new_ip?: unknown; new_user_agent?: string; session_id: string }
        Returns: boolean
      }
      user_is_invited_to_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_is_member_of_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_is_owner_of_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_org_role_is_higher_than: {
        Args: { org_id: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_message: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          tokens_used: number | null
          tool_input: Json | null
          tool_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          tokens_used?: number | null
          tool_input?: Json | null
          tool_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          tokens_used?: number | null
          tool_input?: Json | null
          tool_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_message_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_thread"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_thread: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          metadata: Json
          status: Database["public"]["Enums"]["ai_thread_status"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["ai_thread_status"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["ai_thread_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_thread_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          ai_timestamp: string
          cached_input_tokens: number
          cost: number
          created_at: string
          id: string
          input_tokens: number
          model_id: string
          output_tokens: number
          reasoning_tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_timestamp: string
          cached_input_tokens?: number
          cost?: number
          created_at?: string
          id?: string
          input_tokens?: number
          model_id: string
          output_tokens?: number
          reasoning_tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_timestamp?: string
          cached_input_tokens?: number
          cost?: number
          created_at?: string
          id?: string
          input_tokens?: number
          model_id?: string
          output_tokens?: number
          reasoning_tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_wallet: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_wallet_transaction: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          type: string
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type: string
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_wallet_transaction_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_wallet_transaction_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "ai_wallet"
            referencedColumns: ["id"]
          },
        ]
      }
      booking: {
        Row: {
          company_member_id: string | null
          created_at: string
          customer_billing_address_line1: string | null
          customer_billing_address_line2: string | null
          customer_billing_country: string | null
          customer_billing_zip: string | null
          customer_business_mode: Database["public"]["Enums"]["fiscal_classification_mode"]
          customer_company_name: string | null
          customer_country: string | null
          customer_note: string | null
          customer_siren: string | null
          customer_street: string | null
          customer_vat_number: string | null
          customer_zip: string | null
          email: string | null
          end_at: string | null
          firstname: string
          fiscal_buyer_snapshot: Json
          fiscal_party_type_resolved: Database["public"]["Enums"]["fiscal_party_type"]
          id: string
          invoice_snapshot: Json
          lastname: string | null
          note: string | null
          organization_id: string
          participants: Json | null
          payment_amount: number | null
          payment_authorized_at: string | null
          payment_captured_at: string | null
          payment_currency: string | null
          payment_discount_amount: number
          payment_discount_code: string | null
          payment_discount_code_normalized: string | null
          payment_discount_name: string | null
          payment_discount_type:
            | Database["public"]["Enums"]["discount_type"]
            | null
          payment_discount_value: number | null
          payment_error: string | null
          payment_failed_at: string | null
          payment_intent_id: string | null
          payment_metadata: Json
          payment_mode: string
          payment_refunded_amount: number
          payment_refunded_at: string | null
          payment_released_at: string | null
          payment_status: Database["public"]["Enums"]["booking_payment_status"]
          payment_subtotal_amount: number | null
          payment_subtotal_before_discount_amount: number | null
          payment_tax_amount: number | null
          payment_tax_breakdown: Json
          payment_tax_exclusive_amount: number | null
          payment_tax_inclusive_amount: number | null
          phone: string | null
          published_at: string | null
          relative_id: number
          service_id: string | null
          setup_intent_id: string | null
          slot_id: string | null
          slot_occurrence_id: string | null
          start_at: string | null
          state: Database["public"]["Enums"]["booking_state"]
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          stripe_key: string | null
          stripe_payment_method_id: string | null
          updated_at: string
          vat_validation_message: string | null
          vat_validation_status: Database["public"]["Enums"]["vat_validation_status"]
        }
        Insert: {
          company_member_id?: string | null
          created_at?: string
          customer_billing_address_line1?: string | null
          customer_billing_address_line2?: string | null
          customer_billing_country?: string | null
          customer_billing_zip?: string | null
          customer_business_mode?: Database["public"]["Enums"]["fiscal_classification_mode"]
          customer_company_name?: string | null
          customer_country?: string | null
          customer_note?: string | null
          customer_siren?: string | null
          customer_street?: string | null
          customer_vat_number?: string | null
          customer_zip?: string | null
          email?: string | null
          end_at?: string | null
          firstname: string
          fiscal_buyer_snapshot?: Json
          fiscal_party_type_resolved?: Database["public"]["Enums"]["fiscal_party_type"]
          id?: string
          invoice_snapshot?: Json
          lastname?: string | null
          note?: string | null
          organization_id: string
          participants?: Json | null
          payment_amount?: number | null
          payment_authorized_at?: string | null
          payment_captured_at?: string | null
          payment_currency?: string | null
          payment_discount_amount?: number
          payment_discount_code?: string | null
          payment_discount_code_normalized?: string | null
          payment_discount_name?: string | null
          payment_discount_type?:
            | Database["public"]["Enums"]["discount_type"]
            | null
          payment_discount_value?: number | null
          payment_error?: string | null
          payment_failed_at?: string | null
          payment_intent_id?: string | null
          payment_metadata?: Json
          payment_mode?: string
          payment_refunded_amount?: number
          payment_refunded_at?: string | null
          payment_released_at?: string | null
          payment_status?: Database["public"]["Enums"]["booking_payment_status"]
          payment_subtotal_amount?: number | null
          payment_subtotal_before_discount_amount?: number | null
          payment_tax_amount?: number | null
          payment_tax_breakdown?: Json
          payment_tax_exclusive_amount?: number | null
          payment_tax_inclusive_amount?: number | null
          phone?: string | null
          published_at?: string | null
          relative_id: number
          service_id?: string | null
          setup_intent_id?: string | null
          slot_id?: string | null
          slot_occurrence_id?: string | null
          start_at?: string | null
          state: Database["public"]["Enums"]["booking_state"]
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_key?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          vat_validation_message?: string | null
          vat_validation_status?: Database["public"]["Enums"]["vat_validation_status"]
        }
        Update: {
          company_member_id?: string | null
          created_at?: string
          customer_billing_address_line1?: string | null
          customer_billing_address_line2?: string | null
          customer_billing_country?: string | null
          customer_billing_zip?: string | null
          customer_business_mode?: Database["public"]["Enums"]["fiscal_classification_mode"]
          customer_company_name?: string | null
          customer_country?: string | null
          customer_note?: string | null
          customer_siren?: string | null
          customer_street?: string | null
          customer_vat_number?: string | null
          customer_zip?: string | null
          email?: string | null
          end_at?: string | null
          firstname?: string
          fiscal_buyer_snapshot?: Json
          fiscal_party_type_resolved?: Database["public"]["Enums"]["fiscal_party_type"]
          id?: string
          invoice_snapshot?: Json
          lastname?: string | null
          note?: string | null
          organization_id?: string
          participants?: Json | null
          payment_amount?: number | null
          payment_authorized_at?: string | null
          payment_captured_at?: string | null
          payment_currency?: string | null
          payment_discount_amount?: number
          payment_discount_code?: string | null
          payment_discount_code_normalized?: string | null
          payment_discount_name?: string | null
          payment_discount_type?:
            | Database["public"]["Enums"]["discount_type"]
            | null
          payment_discount_value?: number | null
          payment_error?: string | null
          payment_failed_at?: string | null
          payment_intent_id?: string | null
          payment_metadata?: Json
          payment_mode?: string
          payment_refunded_amount?: number
          payment_refunded_at?: string | null
          payment_released_at?: string | null
          payment_status?: Database["public"]["Enums"]["booking_payment_status"]
          payment_subtotal_amount?: number | null
          payment_subtotal_before_discount_amount?: number | null
          payment_tax_amount?: number | null
          payment_tax_breakdown?: Json
          payment_tax_exclusive_amount?: number | null
          payment_tax_inclusive_amount?: number | null
          phone?: string | null
          published_at?: string | null
          relative_id?: number
          service_id?: string | null
          setup_intent_id?: string | null
          slot_id?: string | null
          slot_occurrence_id?: string | null
          start_at?: string | null
          state?: Database["public"]["Enums"]["booking_state"]
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_key?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          vat_validation_message?: string | null
          vat_validation_status?: Database["public"]["Enums"]["vat_validation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_company_member_id_fkey"
            columns: ["company_member_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slot_occurrence_id_fkey"
            columns: ["slot_occurrence_id"]
            isOneToOne: false
            referencedRelation: "agenda_slot_day"
            referencedColumns: ["slot_occurrence_id"]
          },
          {
            foreignKeyName: "booking_slot_occurrence_id_fkey"
            columns: ["slot_occurrence_id"]
            isOneToOne: false
            referencedRelation: "slot_occurrence"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_client_access_challenge: {
        Row: {
          attempts: number
          consumed_at: string | null
          created_at: string
          email_normalized: string
          expires_at: string
          id: string
          max_attempts: number
          organization_id: string
          otp_hash: string
          otp_salt: string
          requested_ip: string | null
          requested_user_agent: string | null
        }
        Insert: {
          attempts?: number
          consumed_at?: string | null
          created_at?: string
          email_normalized: string
          expires_at: string
          id?: string
          max_attempts?: number
          organization_id: string
          otp_hash: string
          otp_salt: string
          requested_ip?: string | null
          requested_user_agent?: string | null
        }
        Update: {
          attempts?: number
          consumed_at?: string | null
          created_at?: string
          email_normalized?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          organization_id?: string
          otp_hash?: string
          otp_salt?: string
          requested_ip?: string | null
          requested_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_client_access_challenge_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_client_access_session: {
        Row: {
          created_at: string
          created_ip: string | null
          created_user_agent: string | null
          email_normalized: string
          expires_at: string
          id: string
          idle_expires_at: string
          last_accessed_at: string
          organization_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_ip?: string | null
          created_user_agent?: string | null
          email_normalized: string
          expires_at: string
          id?: string
          idle_expires_at: string
          last_accessed_at?: string
          organization_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          created_ip?: string | null
          created_user_agent?: string | null
          email_normalized?: string
          expires_at?: string
          id?: string
          idle_expires_at?: string
          last_accessed_at?: string
          organization_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_client_access_session_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_communication_message: {
        Row: {
          body_html: string | null
          body_text: string | null
          booking_id: string
          channel: string
          created_at: string
          direction: string
          id: string
          in_reply_to_rfc: string | null
          message_id_rfc: string | null
          metadata: Json
          organization_id: string
          provider: string | null
          provider_message_id: string | null
          received_at: string | null
          recipient: string | null
          sender: string | null
          sent_at: string | null
          status: string
          subject: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          booking_id: string
          channel: string
          created_at?: string
          direction: string
          id?: string
          in_reply_to_rfc?: string | null
          message_id_rfc?: string | null
          metadata?: Json
          organization_id: string
          provider?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          booking_id?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          in_reply_to_rfc?: string | null
          message_id_rfc?: string | null
          metadata?: Json
          organization_id?: string
          provider?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_communication_message_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_communication_message_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_communication_message_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "booking_communication_thread"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_communication_status_event: {
        Row: {
          booking_id: string
          created_at: string
          error: string | null
          event_at: string
          event_type: string
          id: string
          message_id: string
          organization_id: string
          payload: Json
          provider: string | null
          provider_event_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          error?: string | null
          event_at?: string
          event_type: string
          id?: string
          message_id: string
          organization_id: string
          payload?: Json
          provider?: string | null
          provider_event_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          error?: string | null
          event_at?: string
          event_type?: string
          id?: string
          message_id?: string
          organization_id?: string
          payload?: Json
          provider?: string | null
          provider_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_communication_status_event_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_communication_status_event_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "booking_communication_message"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_communication_status_event_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_communication_thread: {
        Row: {
          booking_id: string
          channel: string
          created_at: string
          id: string
          last_message_at: string | null
          organization_id: string
          participant_key: string
          provider_thread_key: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          channel: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          organization_id: string
          participant_key: string
          provider_thread_key?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          channel?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          organization_id?: string
          participant_key?: string
          provider_thread_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_communication_thread_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_communication_thread_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_sms_reminder: {
        Row: {
          booking_id: string
          created_at: string
          organization_id: string
          scheduled_for: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          organization_id: string
          scheduled_for: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          organization_id?: string
          scheduled_for?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_sms_reminder_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_sms_reminder_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout: {
        Row: {
          appearance: Json
          content: Json
          created_at: string
          custom_head_content: string | null
          custom_javascript: string | null
          id: string
          name: string
          organization_id: string
          page_title: string | null
          published_at: string | null
          relative_id: number
          settings: Json
          slug: string
          state: Database["public"]["Enums"]["content_state"]
          updated_at: string
        }
        Insert: {
          appearance: Json
          content: Json
          created_at?: string
          custom_head_content?: string | null
          custom_javascript?: string | null
          id?: string
          name: string
          organization_id: string
          page_title?: string | null
          published_at?: string | null
          relative_id: number
          settings?: Json
          slug: string
          state?: Database["public"]["Enums"]["content_state"]
          updated_at?: string
        }
        Update: {
          appearance?: Json
          content?: Json
          created_at?: string
          custom_head_content?: string | null
          custom_javascript?: string | null
          id?: string
          name?: string
          organization_id?: string
          page_title?: string | null
          published_at?: string | null
          relative_id?: number
          settings?: Json
          slug?: string
          state?: Database["public"]["Enums"]["content_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_page_view: {
        Row: {
          checkout_id: string
          created_at: string
          id: string
          organization_id: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          view_id: string
        }
        Insert: {
          checkout_id: string
          created_at?: string
          id?: string
          organization_id: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          view_id: string
        }
        Update: {
          checkout_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          view_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_page_view_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_page_view_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_service: {
        Row: {
          checkout_id: string
          created_at: string
          organization_id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          checkout_id: string
          created_at?: string
          organization_id: string
          service_id: string
          updated_at?: string
        }
        Update: {
          checkout_id?: string
          created_at?: string
          organization_id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_service_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_service_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_service_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_note: {
        Row: {
          booking_id: string
          created_at: string
          currency: string
          id: string
          invoice_id: string
          issued_at: string
          metadata: Json
          number: string
          organization_id: string
          pdf_path: string | null
          pdf_public_url: string | null
          reason: string | null
          refund_amount: number
          refund_tax_amount: number
          sequence: number
          snapshot: Json
          status: Database["public"]["Enums"]["credit_note_status"]
          stripe_refund_id: string | null
          updated_at: string
          year: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          currency: string
          id?: string
          invoice_id: string
          issued_at?: string
          metadata?: Json
          number: string
          organization_id: string
          pdf_path?: string | null
          pdf_public_url?: string | null
          reason?: string | null
          refund_amount: number
          refund_tax_amount?: number
          sequence: number
          snapshot?: Json
          status?: Database["public"]["Enums"]["credit_note_status"]
          stripe_refund_id?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          issued_at?: string
          metadata?: Json
          number?: string
          organization_id?: string
          pdf_path?: string | null
          pdf_public_url?: string | null
          reason?: string | null
          refund_amount?: number
          refund_tax_amount?: number
          sequence?: number
          snapshot?: Json
          status?: Database["public"]["Enums"]["credit_note_status"]
          stripe_refund_id?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_note_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_note_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      date_memo: {
        Row: {
          color: string | null
          content: string
          created_at: string
          date: string
          id: string
          organization_id: string
          organization_role_id: string | null
          published_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string
          date: string
          id?: string
          organization_id: string
          organization_role_id?: string | null
          published_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          date?: string
          id?: string
          organization_id?: string
          organization_role_id?: string | null
          published_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_memo_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_memo_organization_role_id_fkey"
            columns: ["organization_role_id"]
            isOneToOne: false
            referencedRelation: "organization_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_memo_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_export_job: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          file_public_url: string | null
          format: string
          id: string
          organization_id: string
          payload: Json
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["fiscal_export_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_public_url?: string | null
          format?: string
          id?: string
          organization_id: string
          payload?: Json
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["fiscal_export_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_public_url?: string | null
          format?: string
          id?: string
          organization_id?: string
          payload?: Json
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["fiscal_export_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_export_job_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_payment_report_item: {
        Row: {
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          organization_id: string
          paid_amount: number
          paid_at: string
          payload: Json
          payment_intent_id: string | null
          transmission_id: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          currency: string
          id?: string
          invoice_id?: string | null
          organization_id: string
          paid_amount: number
          paid_at: string
          payload?: Json
          payment_intent_id?: string | null
          transmission_id?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          organization_id?: string
          paid_amount?: number
          paid_at?: string
          payload?: Json
          payment_intent_id?: string | null
          transmission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_payment_report_item_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_payment_report_item_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_payment_report_item_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_payment_report_item_transmission_id_fkey"
            columns: ["transmission_id"]
            isOneToOne: false
            referencedRelation: "fiscal_transmission"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_pdp_connection: {
        Row: {
          account_id: string | null
          connected_at: string | null
          created_at: string
          credentials_encrypted: Json
          disconnected_at: string | null
          external_reference: string | null
          id: string
          is_active: boolean
          last_error: string | null
          last_synced_at: string | null
          metadata: Json
          organization_id: string
          provider_slug: string
          status: Database["public"]["Enums"]["pdp_connection_status"]
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          connected_at?: string | null
          created_at?: string
          credentials_encrypted?: Json
          disconnected_at?: string | null
          external_reference?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_synced_at?: string | null
          metadata?: Json
          organization_id: string
          provider_slug: string
          status?: Database["public"]["Enums"]["pdp_connection_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          connected_at?: string | null
          created_at?: string
          credentials_encrypted?: Json
          disconnected_at?: string | null
          external_reference?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_synced_at?: string | null
          metadata?: Json
          organization_id?: string
          provider_slug?: string
          status?: Database["public"]["Enums"]["pdp_connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_pdp_connection_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_transaction_report_item: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          operation_category: string
          operation_date: string
          organization_id: string
          party_type: Database["public"]["Enums"]["fiscal_party_type"]
          payload: Json
          tax_amount: number
          transmission_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency: string
          id?: string
          invoice_id?: string | null
          operation_category?: string
          operation_date: string
          organization_id: string
          party_type?: Database["public"]["Enums"]["fiscal_party_type"]
          payload?: Json
          tax_amount?: number
          transmission_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          operation_category?: string
          operation_date?: string
          organization_id?: string
          party_type?: Database["public"]["Enums"]["fiscal_party_type"]
          payload?: Json
          tax_amount?: number
          transmission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_transaction_report_item_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transaction_report_item_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transaction_report_item_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transaction_report_item_transmission_id_fkey"
            columns: ["transmission_id"]
            isOneToOne: false
            referencedRelation: "fiscal_transmission"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_transmission: {
        Row: {
          accepted_at: string | null
          attempt_count: number
          attempt_scope: string | null
          booking_id: string | null
          connection_id: string | null
          created_at: string
          dead_letter_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          idempotency_key: string
          invoice_id: string | null
          max_attempts: number
          metadata: Json
          next_retry_at: string | null
          organization_id: string
          payload: Json
          processed_at: string | null
          provider_document_id: string | null
          provider_slug: string
          provider_status: string | null
          rejected_at: string | null
          response_payload: Json
          status: Database["public"]["Enums"]["fiscal_transmission_status"]
          submitted_at: string | null
          transmission_type: Database["public"]["Enums"]["fiscal_transmission_type"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          attempt_count?: number
          attempt_scope?: string | null
          booking_id?: string | null
          connection_id?: string | null
          created_at?: string
          dead_letter_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          idempotency_key: string
          invoice_id?: string | null
          max_attempts?: number
          metadata?: Json
          next_retry_at?: string | null
          organization_id: string
          payload?: Json
          processed_at?: string | null
          provider_document_id?: string | null
          provider_slug: string
          provider_status?: string | null
          rejected_at?: string | null
          response_payload?: Json
          status?: Database["public"]["Enums"]["fiscal_transmission_status"]
          submitted_at?: string | null
          transmission_type: Database["public"]["Enums"]["fiscal_transmission_type"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          attempt_count?: number
          attempt_scope?: string | null
          booking_id?: string | null
          connection_id?: string | null
          created_at?: string
          dead_letter_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          idempotency_key?: string
          invoice_id?: string | null
          max_attempts?: number
          metadata?: Json
          next_retry_at?: string | null
          organization_id?: string
          payload?: Json
          processed_at?: string | null
          provider_document_id?: string | null
          provider_slug?: string
          provider_status?: string | null
          rejected_at?: string | null
          response_payload?: Json
          status?: Database["public"]["Enums"]["fiscal_transmission_status"]
          submitted_at?: string | null
          transmission_type?: Database["public"]["Enums"]["fiscal_transmission_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_transmission_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transmission_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "fiscal_pdp_connection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transmission_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_transmission_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_binding: {
        Row: {
          calendar_id: string
          created_at: string
          id: string
          organization_id: string
          organization_member_id: string | null
          scope_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          id?: string
          organization_id: string
          organization_member_id?: string | null
          scope_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          organization_member_id?: string | null
          scope_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_binding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_binding_organization_member_id_fkey"
            columns: ["organization_member_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_binding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_connection: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          google_email: string | null
          google_sub: string | null
          id: string
          refresh_token_encrypted: string
          revoked_at: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          google_email?: string | null
          google_sub?: string | null
          id?: string
          refresh_token_encrypted: string
          revoked_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          google_email?: string | null
          google_sub?: string | null
          id?: string
          refresh_token_encrypted?: string
          revoked_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_connection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_event_map: {
        Row: {
          binding_id: string
          created_at: string
          google_event_id: string
          id: string
          last_synced_at: string
          organization_id: string
          payload_hash: string
          slot_occurrence_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          binding_id: string
          created_at?: string
          google_event_id: string
          id?: string
          last_synced_at?: string
          organization_id: string
          payload_hash: string
          slot_occurrence_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          binding_id?: string
          created_at?: string
          google_event_id?: string
          id?: string
          last_synced_at?: string
          organization_id?: string
          payload_hash?: string
          slot_occurrence_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_event_map_binding_id_fkey"
            columns: ["binding_id"]
            isOneToOne: false
            referencedRelation: "google_calendar_binding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_event_map_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_event_map_slot_occurrence_id_fkey"
            columns: ["slot_occurrence_id"]
            isOneToOne: false
            referencedRelation: "agenda_slot_day"
            referencedColumns: ["slot_occurrence_id"]
          },
          {
            foreignKeyName: "google_calendar_event_map_slot_occurrence_id_fkey"
            columns: ["slot_occurrence_id"]
            isOneToOne: false
            referencedRelation: "slot_occurrence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_event_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_sync_job: {
        Row: {
          attempts: number
          created_at: string
          dedupe_key: string
          id: string
          last_error: string | null
          organization_id: string
          reason: string
          run_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedupe_key: string
          id?: string
          last_error?: string | null
          organization_id: string
          reason: string
          run_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedupe_key?: string
          id?: string
          last_error?: string | null
          organization_id?: string
          reason?: string
          run_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_sync_job_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_sync_job_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice: {
        Row: {
          booking_id: string
          created_at: string
          currency: string
          id: string
          metadata: Json
          number: string
          organization_id: string
          paid_at: string | null
          pdf_path: string | null
          pdf_public_url: string | null
          refunded_amount: number
          sequence: number
          snapshot: Json
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          currency: string
          id?: string
          metadata?: Json
          number: string
          organization_id: string
          paid_at?: string | null
          pdf_path?: string | null
          pdf_public_url?: string | null
          refunded_amount?: number
          sequence: number
          snapshot?: Json
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at?: string
          year: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          number?: string
          organization_id?: string
          paid_at?: string | null
          pdf_path?: string | null
          pdf_public_url?: string | null
          refunded_amount?: number
          sequence?: number
          snapshot?: Json
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counter: {
        Row: {
          created_at: string
          last_value: number
          organization_id: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          last_value?: number
          organization_id: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          last_value?: number
          organization_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_counter_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          android_channel_id: string | null
          body: string
          created_at: string
          data: Json | null
          icon: string | null
          id: string
          image_url: string | null
          ios_badge_count: number | null
          ios_sound_name: string | null
          ios_subtitle: string | null
          organization_id: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          android_channel_id?: string | null
          body: string
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          ios_badge_count?: number | null
          ios_sound_name?: string | null
          ios_subtitle?: string | null
          organization_id?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          android_channel_id?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          ios_badge_count?: number | null
          ios_sound_name?: string | null
          ios_subtitle?: string | null
          organization_id?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      organization_discount_code: {
        Row: {
          active: boolean
          code: string
          code_normalized: string
          created_at: string
          expires_on: string | null
          fixed_amount: number | null
          id: string
          limit_per_email: boolean
          max_total_uses: number | null
          metadata: Json
          name: string
          organization_id: string
          percentage_amount: number | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          code_normalized: string
          created_at?: string
          expires_on?: string | null
          fixed_amount?: number | null
          id?: string
          limit_per_email?: boolean
          max_total_uses?: number | null
          metadata?: Json
          name: string
          organization_id: string
          percentage_amount?: number | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          code_normalized?: string
          created_at?: string
          expires_on?: string | null
          fixed_amount?: number | null
          id?: string
          limit_per_email?: boolean
          max_total_uses?: number | null
          metadata?: Json
          name?: string
          organization_id?: string
          percentage_amount?: number | null
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_discount_code_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_discount_code_redemption: {
        Row: {
          booking_id: string | null
          consumed_at: string | null
          created_at: string
          discount_amount: number
          discount_code_id: string
          id: string
          metadata: Json
          normalized_email: string | null
          organization_id: string
          release_reason: string | null
          released_at: string | null
          reserved_until: string | null
          status: Database["public"]["Enums"]["discount_redemption_status"]
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          consumed_at?: string | null
          created_at?: string
          discount_amount?: number
          discount_code_id: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          organization_id: string
          release_reason?: string | null
          released_at?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["discount_redemption_status"]
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          consumed_at?: string | null
          created_at?: string
          discount_amount?: number
          discount_code_id?: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          organization_id?: string
          release_reason?: string | null
          released_at?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["discount_redemption_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_discount_code_redemption_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_discount_code_redemption_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "organization_discount_code"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_discount_code_redemption_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_discount_code_service: {
        Row: {
          created_at: string
          discount_code_id: string
          organization_id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_code_id: string
          organization_id: string
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_code_id?: string
          organization_id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_discount_code_service_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "organization_discount_code"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_discount_code_service_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_discount_code_service_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitation: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string
          organization_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          organization_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          organization_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitation_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitation_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitation_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_role"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_member: {
        Row: {
          created_at: string
          id: string
          is_owner: boolean
          organization_id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_owner?: boolean
          organization_id: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_owner?: boolean
          organization_id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_member_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_member_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_member_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_role: {
        Row: {
          created_at: string
          hierarchy_level: number
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hierarchy_level: number
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hierarchy_level?: number
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_role_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_role_permission: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          permission: Database["public"]["Enums"]["org_permission"]
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          permission: Database["public"]["Enums"]["org_permission"]
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          permission?: Database["public"]["Enums"]["org_permission"]
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_role_permission_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_role_permission_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_role"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_setting: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "organization_setting_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_tax: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          mode: Database["public"]["Enums"]["tax_mode"]
          name: string
          organization_id: string
          rate: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          mode?: Database["public"]["Enums"]["tax_mode"]
          name: string
          organization_id: string
          rate: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          mode?: Database["public"]["Enums"]["tax_mode"]
          name?: string
          organization_id?: string
          rate?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_tax_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_data_schema: {
        Row: {
          created_at: string
          display_according_to_id: string | null
          id: string
          name: string
          organization_id: string
          published_at: string | null
          schema: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_according_to_id?: string | null
          id?: string
          name: string
          organization_id: string
          published_at?: string | null
          schema: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_according_to_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          published_at?: string | null
          schema?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_data_schema_display_according_to_id_fkey"
            columns: ["display_according_to_id"]
            isOneToOne: false
            referencedRelation: "participant_data_schema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_data_schema_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      planoby_stripe_event_log: {
        Row: {
          booking_id: string | null
          event_type: string
          id: string
          organization_id: string | null
          payload: Json
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          booking_id?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          booking_id?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planoby_stripe_event_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planoby_stripe_event_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      service: {
        Row: {
          calendar_color: string
          confirmation_page_message: string | null
          created_at: string
          description: string | null
          duration: string | null
          email_content: string | null
          featured_image: string | null
          id: string
          images: Json | null
          location: string | null
          max_participant: number | null
          min_participant: number
          name: string
          organization_id: string
          published_at: string | null
          relative_id: number
          sms_content: string | null
          state: Database["public"]["Enums"]["content_state"]
          tax_mode: Database["public"]["Enums"]["service_tax_mode"]
          updated_at: string
        }
        Insert: {
          calendar_color: string
          confirmation_page_message?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          email_content?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          max_participant?: number | null
          min_participant: number
          name: string
          organization_id: string
          published_at?: string | null
          relative_id: number
          sms_content?: string | null
          state?: Database["public"]["Enums"]["content_state"]
          tax_mode?: Database["public"]["Enums"]["service_tax_mode"]
          updated_at?: string
        }
        Update: {
          calendar_color?: string
          confirmation_page_message?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          email_content?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          max_participant?: number | null
          min_participant?: number
          name?: string
          organization_id?: string
          published_at?: string | null
          relative_id?: number
          sms_content?: string | null
          state?: Database["public"]["Enums"]["content_state"]
          tax_mode?: Database["public"]["Enums"]["service_tax_mode"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      service_participant_data_schema: {
        Row: {
          created_at: string
          organization_id: string
          participant_data_schema_id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          participant_data_schema_id: string
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          participant_data_schema_id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_participant_data_schema_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_participant_data_schema_participant_data_schema_id_fkey"
            columns: ["participant_data_schema_id"]
            isOneToOne: false
            referencedRelation: "participant_data_schema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_participant_data_schema_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_extra: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          is_default: boolean
          organization_id: string
          schema_doc_id: string | null
          service_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          is_default?: boolean
          organization_id: string
          schema_doc_id?: string | null
          service_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          is_default?: boolean
          organization_id?: string
          schema_doc_id?: string | null
          service_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_extra_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_extra_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_matrix: {
        Row: {
          col_schema_id: string | null
          created_at: string
          currency: string
          fallback: number | null
          id: string
          organization_id: string
          row_schema_id: string | null
          service_id: string
          updated_at: string
        }
        Insert: {
          col_schema_id?: string | null
          created_at?: string
          currency?: string
          fallback?: number | null
          id?: string
          organization_id: string
          row_schema_id?: string | null
          service_id: string
          updated_at?: string
        }
        Update: {
          col_schema_id?: string | null
          created_at?: string
          currency?: string
          fallback?: number | null
          id?: string
          organization_id?: string
          row_schema_id?: string | null
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_matrix_col_schema_id_fkey"
            columns: ["col_schema_id"]
            isOneToOne: false
            referencedRelation: "participant_data_schema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_matrix_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_matrix_row_schema_id_fkey"
            columns: ["row_schema_id"]
            isOneToOne: false
            referencedRelation: "participant_data_schema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_matrix_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_matrix_cell: {
        Row: {
          amount: number
          col_index: number
          created_at: string
          matrix_id: string
          organization_id: string
          row_index: number
          updated_at: string
        }
        Insert: {
          amount: number
          col_index: number
          created_at?: string
          matrix_id: string
          organization_id: string
          row_index: number
          updated_at?: string
        }
        Update: {
          amount?: number
          col_index?: number
          created_at?: string
          matrix_id?: string
          organization_id?: string
          row_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_matrix_cell_matrix_id_fkey"
            columns: ["matrix_id"]
            isOneToOne: false
            referencedRelation: "service_price_matrix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_matrix_cell_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_matrix_interval: {
        Row: {
          axis: Database["public"]["Enums"]["matrix_axis"]
          created_at: string
          end_value: number
          id: string
          index: number
          matrix_id: string
          organization_id: string
          start_value: number
          updated_at: string
        }
        Insert: {
          axis: Database["public"]["Enums"]["matrix_axis"]
          created_at?: string
          end_value: number
          id?: string
          index: number
          matrix_id: string
          organization_id: string
          start_value: number
          updated_at?: string
        }
        Update: {
          axis?: Database["public"]["Enums"]["matrix_axis"]
          created_at?: string
          end_value?: number
          id?: string
          index?: number
          matrix_id?: string
          organization_id?: string
          start_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_matrix_interval_matrix_id_fkey"
            columns: ["matrix_id"]
            isOneToOne: false
            referencedRelation: "service_price_matrix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_matrix_interval_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tax_assignment: {
        Row: {
          created_at: string
          organization_id: string
          service_id: string
          tax_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          service_id: string
          tax_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          service_id?: string
          tax_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tax_assignment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tax_assignment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tax_assignment_tax_id_fkey"
            columns: ["tax_id"]
            isOneToOne: false
            referencedRelation: "organization_tax"
            referencedColumns: ["id"]
          },
        ]
      }
      slot: {
        Row: {
          company_member_id: string | null
          created_at: string
          custom_color: string | null
          custom_label: string | null
          date: string
          end: string
          frequency: Database["public"]["Enums"]["frequency_type"]
          id: string
          max_participant: number | null
          meta_frequency: string | null
          organization_id: string
          private_comment: string | null
          published_at: string | null
          service_id: string | null
          start: string
          state: Database["public"]["Enums"]["slot_state"]
          updated_at: string
          visible: boolean | null
        }
        Insert: {
          company_member_id?: string | null
          created_at?: string
          custom_color?: string | null
          custom_label?: string | null
          date: string
          end: string
          frequency: Database["public"]["Enums"]["frequency_type"]
          id?: string
          max_participant?: number | null
          meta_frequency?: string | null
          organization_id: string
          private_comment?: string | null
          published_at?: string | null
          service_id?: string | null
          start: string
          state: Database["public"]["Enums"]["slot_state"]
          updated_at?: string
          visible?: boolean | null
        }
        Update: {
          company_member_id?: string | null
          created_at?: string
          custom_color?: string | null
          custom_label?: string | null
          date?: string
          end?: string
          frequency?: Database["public"]["Enums"]["frequency_type"]
          id?: string
          max_participant?: number | null
          meta_frequency?: string | null
          organization_id?: string
          private_comment?: string | null
          published_at?: string | null
          service_id?: string | null
          start?: string
          state?: Database["public"]["Enums"]["slot_state"]
          updated_at?: string
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_company_member_id_fkey"
            columns: ["company_member_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_occurrence: {
        Row: {
          booking_count: number
          company_member_id: string | null
          created_at: string
          date: string
          end_at: string
          id: string
          is_exception: boolean
          organization_id: string
          published_at: string | null
          service_id: string | null
          slot_id: string
          start_at: string
          state: Database["public"]["Enums"]["slot_state"]
          updated_at: string
          visible: boolean
        }
        Insert: {
          booking_count?: number
          company_member_id?: string | null
          created_at?: string
          date: string
          end_at: string
          id?: string
          is_exception?: boolean
          organization_id: string
          published_at?: string | null
          service_id?: string | null
          slot_id: string
          start_at: string
          state: Database["public"]["Enums"]["slot_state"]
          updated_at?: string
          visible?: boolean
        }
        Update: {
          booking_count?: number
          company_member_id?: string | null
          created_at?: string
          date?: string
          end_at?: string
          id?: string
          is_exception?: boolean
          organization_id?: string
          published_at?: string | null
          service_id?: string | null
          slot_id?: string
          start_at?: string
          state?: Database["public"]["Enums"]["slot_state"]
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "slot_occurrence_company_member_id_fkey"
            columns: ["company_member_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slot"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription: {
        Row: {
          created_at: string
          id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_record: {
        Row: {
          action_type: string
          created_at: string
          id: string
          subscription_id: string
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          subscription_id: string
          tokens_used: number
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          subscription_id?: string
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_record_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_record_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          auth_user_id: string
          completed_onboarding: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          profile_url: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string
          completed_onboarding?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          profile_url?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          completed_onboarding?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          profile_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_setting: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_setting_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      vat_validation_log: {
        Row: {
          booking_id: string | null
          checked_at: string
          country_code: string | null
          created_at: string
          id: string
          message: string | null
          normalized_vat_number: string | null
          organization_id: string
          provider: string
          raw_response: Json
          status: Database["public"]["Enums"]["vat_validation_status"]
          vat_number: string | null
        }
        Insert: {
          booking_id?: string | null
          checked_at?: string
          country_code?: string | null
          created_at?: string
          id?: string
          message?: string | null
          normalized_vat_number?: string | null
          organization_id: string
          provider?: string
          raw_response?: Json
          status?: Database["public"]["Enums"]["vat_validation_status"]
          vat_number?: string | null
        }
        Update: {
          booking_id?: string | null
          checked_at?: string
          country_code?: string | null
          created_at?: string
          id?: string
          message?: string | null
          normalized_vat_number?: string | null
          organization_id?: string
          provider?: string
          raw_response?: Json
          status?: Database["public"]["Enums"]["vat_validation_status"]
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vat_validation_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vat_validation_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agenda_slot_day: {
        Row: {
          bookings: Json | null
          date: string | null
          end_at: string | null
          organization_id: string | null
          organization_member_id: string | null
          service_calendar_color: string | null
          service_duration: string | null
          service_id: string | null
          service_name: string | null
          slot_id: string | null
          slot_occurrence_id: string | null
          start_at: string | null
          state: Database["public"]["Enums"]["slot_state"] | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_occurrence_company_member_id_fkey"
            columns: ["organization_member_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_occurrence_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slot"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      planoby_align_date_to_weekly_days: {
        Args: { p_direction?: number; p_date: string; p_days: Json }
        Returns: string
      }
      planoby_bootstrap_dev_reset_account: {
        Args: {
          p_auth_user_id: string
          p_user_name?: string
          p_user_email?: string
          p_org_name?: string
          p_org_slug?: string
        }
        Returns: string
      }
      planoby_cron_worker_base_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      planoby_cron_worker_secret: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      planoby_get_service_prices_json: {
        Args: { p_service_id: string }
        Returns: Json
      }
      planoby_org_setting_json: {
        Args: { p_organization_id: string; p_name: string }
        Returns: Json
      }
      planoby_org_setting_text: {
        Args: { p_default?: string; p_organization_id: string; p_name: string }
        Returns: string
      }
      planoby_org_timezone_value: {
        Args: { p_organization_id: string }
        Returns: string
      }
      planoby_refresh_slot_occurrence_booking_count: {
        Args: { p_slot_occurrence_id: string }
        Returns: undefined
      }
      planoby_refresh_slot_occurrence_booking_counts_for_slot: {
        Args: { p_slot_id: string }
        Returns: undefined
      }
      planoby_resolve_slot_occurrence_id: {
        Args: { p_slot_id: string; p_day: string }
        Returns: string
      }
      planoby_should_emit_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      planoby_slot_matches_day_core: {
        Args: {
          p_slot_date: string
          p_frequency: string
          p_day: string
          p_meta_frequency: string
        }
        Returns: boolean
      }
      planoby_sync_all_slot_occurrences: {
        Args: { p_organization_id?: string }
        Returns: undefined
      }
      planoby_sync_booked_occurrence_days_for_slot: {
        Args: { p_slot_id: string }
        Returns: undefined
      }
      planoby_sync_bookings_for_slot: {
        Args: { p_slot_id: string }
        Returns: undefined
      }
      planoby_sync_slot_occurrences: {
        Args: {
          p_window_end?: string
          p_window_start?: string
          p_slot_id: string
        }
        Returns: undefined
      }
      planoby_timestamp_for_org_day_time: {
        Args: { p_time: string; p_organization_id: string; p_day: string }
        Returns: string
      }
      user_org_role_is_higher_than: {
        Args: { target_user_id: string; org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ai_thread_status: "regular" | "archived"
      booking_payment_status:
        | "none"
        | "setup_pending"
        | "setup_succeeded"
        | "payment_pending"
        | "authorized"
        | "captured"
        | "failed"
        | "released"
      booking_state:
        | "requires_payment_method"
        | "requires_slot_confirmation"
        | "canceled"
        | "confirmed"
        | "charged"
        | "confirmation_failed"
        | "partially_refunded"
        | "refunded"
      content_state: "draft" | "published" | "archived"
      credit_note_status: "issued" | "void"
      discount_redemption_status: "reserved" | "consumed" | "released"
      discount_type: "percentage" | "fixed"
      fiscal_classification_mode: "auto" | "force_b2b" | "force_b2c"
      fiscal_export_status: "pending" | "completed" | "failed"
      fiscal_party_type: "b2c" | "b2b_fr" | "b2b_non_fr"
      fiscal_transmission_status:
        | "pending"
        | "submitted"
        | "accepted"
        | "rejected"
        | "retrying"
        | "dead_letter"
      fiscal_transmission_type:
        | "einvoice_b2b_fr"
        | "ereporting_transaction"
        | "ereporting_payment"
      frequency_type: "once" | "day" | "week" | "month" | "year"
      invoice_status: "issued" | "partially_refunded" | "refunded"
      matrix_axis: "row" | "col"
      notification_type: "info" | "warning" | "error" | "success"
      org_permission:
        | "organization.manage"
        | "member.manage"
        | "setting.manage"
        | "media.manage"
        | "booking.select"
        | "booking.insert"
        | "booking.update"
        | "booking.delete"
        | "service.select"
        | "service.insert"
        | "service.update"
        | "service.delete"
        | "checkout.select"
        | "checkout.insert"
        | "checkout.update"
        | "checkout.delete"
        | "slot.select"
        | "slot.insert"
        | "slot.update"
        | "slot.delete"
        | "slot_admin.select"
        | "slot_admin.insert"
        | "slot_admin.update"
        | "slot_admin.delete"
      pdp_connection_status:
        | "not_connected"
        | "connecting"
        | "connected"
        | "error"
      service_tax_mode: "all" | "custom"
      slot_state: "confirmed" | "requested"
      tax_mode: "inclusive" | "exclusive"
      vat_validation_status:
        | "not_checked"
        | "valid"
        | "invalid"
        | "service_unavailable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { metadata: Json; owner: string; bucketid: string; name: string }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          delimiter_param: string
          bucket_id: string
          prefix_param: string
          next_upload_token?: string
          max_keys?: number
          next_key_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          max_keys?: number
          prefix_param: string
          bucket_id: string
          next_token?: string
          start_after?: string
          delimiter_param: string
        }
        Returns: {
          id: string
          metadata: Json
          updated_at: string
          name: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortorder?: string
          sortcolumn?: string
        }
        Returns: {
          name: string
          metadata: Json
          last_accessed_at: string
          created_at: string
          updated_at: string
          id: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
          prefix: string
          bucketname: string
          limits?: number
        }
        Returns: {
          metadata: Json
          id: string
          name: string
          updated_at: string
          created_at: string
          last_accessed_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          id: string
          name: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          limits?: number
          bucket_name: string
          prefix: string
          start_after?: string
          levels?: number
        }
        Returns: {
          key: string
          id: string
          updated_at: string
          metadata: Json
          created_at: string
          name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  kit: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_thread_status: ["regular", "archived"],
      booking_payment_status: [
        "none",
        "setup_pending",
        "setup_succeeded",
        "payment_pending",
        "authorized",
        "captured",
        "failed",
        "released",
      ],
      booking_state: [
        "requires_payment_method",
        "requires_slot_confirmation",
        "canceled",
        "confirmed",
        "charged",
        "confirmation_failed",
        "partially_refunded",
        "refunded",
      ],
      content_state: ["draft", "published", "archived"],
      credit_note_status: ["issued", "void"],
      discount_redemption_status: ["reserved", "consumed", "released"],
      discount_type: ["percentage", "fixed"],
      fiscal_classification_mode: ["auto", "force_b2b", "force_b2c"],
      fiscal_export_status: ["pending", "completed", "failed"],
      fiscal_party_type: ["b2c", "b2b_fr", "b2b_non_fr"],
      fiscal_transmission_status: [
        "pending",
        "submitted",
        "accepted",
        "rejected",
        "retrying",
        "dead_letter",
      ],
      fiscal_transmission_type: [
        "einvoice_b2b_fr",
        "ereporting_transaction",
        "ereporting_payment",
      ],
      frequency_type: ["once", "day", "week", "month", "year"],
      invoice_status: ["issued", "partially_refunded", "refunded"],
      matrix_axis: ["row", "col"],
      notification_type: ["info", "warning", "error", "success"],
      org_permission: [
        "organization.manage",
        "member.manage",
        "setting.manage",
        "media.manage",
        "booking.select",
        "booking.insert",
        "booking.update",
        "booking.delete",
        "service.select",
        "service.insert",
        "service.update",
        "service.delete",
        "checkout.select",
        "checkout.insert",
        "checkout.update",
        "checkout.delete",
        "slot.select",
        "slot.insert",
        "slot.update",
        "slot.delete",
        "slot_admin.select",
        "slot_admin.insert",
        "slot_admin.update",
        "slot_admin.delete",
      ],
      pdp_connection_status: [
        "not_connected",
        "connecting",
        "connected",
        "error",
      ],
      service_tax_mode: ["all", "custom"],
      slot_state: ["confirmed", "requested"],
      tax_mode: ["inclusive", "exclusive"],
      vat_validation_status: [
        "not_checked",
        "valid",
        "invalid",
        "service_unavailable",
      ],
    },
  },
  storage: {
    Enums: {},
  },
} as const

