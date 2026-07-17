export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customer_ratings: {
        Row: {
          comment: string | null
          created_at: string
          customer_email: string | null
          id: string
          order_id: string | null
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          order_id?: string | null
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          order_id?: string | null
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "storybook_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          discount_code_sent: string | null
          email: string
          id: string
          ip_address: string | null
          source: string
        }
        Insert: {
          created_at?: string
          discount_code_sent?: string | null
          email: string
          id?: string
          ip_address?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          discount_code_sent?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          source?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      storybook_audio: {
        Row: {
          audio_storage_path: string | null
          created_at: string
          id: string
          order_id: string
          page_number: number
          page_text: string
          word_timings: Json | null
        }
        Insert: {
          audio_storage_path?: string | null
          created_at?: string
          id?: string
          order_id: string
          page_number: number
          page_text: string
          word_timings?: Json | null
        }
        Update: {
          audio_storage_path?: string | null
          created_at?: string
          id?: string
          order_id?: string
          page_number?: number
          page_text?: string
          word_timings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storybook_audio_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "storybook_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_orders: {
        Row: {
          child_age: string
          child_name: string
          child_photo_path: string | null
          coloring_prompts: Json | null
          completed_at: string | null
          created_at: string
          customer_email: string | null
          error_message: string | null
          fulfillment_confirmed_at: string | null
          has_supporting_character: boolean | null
          id: string
          illustration_prompts: Json | null
          illustration_storage_paths: Json | null
          pdf_storage_path: string | null
          pdf_url: string | null
          selected_addons: Json | null
          shopify_checkout_token: string | null
          shopify_order_id: string | null
          status: string
          story_text: string | null
          story_title: string | null
          strength: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          supporting_character_name: string | null
          supporting_character_photo_path: string | null
          theme: string
        }
        Insert: {
          child_age: string
          child_name: string
          child_photo_path?: string | null
          coloring_prompts?: Json | null
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          fulfillment_confirmed_at?: string | null
          has_supporting_character?: boolean | null
          id?: string
          illustration_prompts?: Json | null
          illustration_storage_paths?: Json | null
          pdf_storage_path?: string | null
          pdf_url?: string | null
          selected_addons?: Json | null
          shopify_checkout_token?: string | null
          shopify_order_id?: string | null
          status?: string
          story_text?: string | null
          story_title?: string | null
          strength?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          supporting_character_name?: string | null
          supporting_character_photo_path?: string | null
          theme: string
        }
        Update: {
          child_age?: string
          child_name?: string
          child_photo_path?: string | null
          coloring_prompts?: Json | null
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          fulfillment_confirmed_at?: string | null
          has_supporting_character?: boolean | null
          id?: string
          illustration_prompts?: Json | null
          illustration_storage_paths?: Json | null
          pdf_storage_path?: string | null
          pdf_url?: string | null
          selected_addons?: Json | null
          shopify_checkout_token?: string | null
          shopify_order_id?: string | null
          status?: string
          story_text?: string | null
          story_title?: string | null
          strength?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          supporting_character_name?: string | null
          supporting_character_photo_path?: string | null
          theme?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_pdf_received: { Args: { _order_id: string }; Returns: boolean }
      create_pending_order:
        | {
            Args: {
              _child_age: string
              _child_name: string
              _customer_email: string
              _has_supporting_character: boolean
              _selected_addons: Json
              _strength: string
              _supporting_character_name: string
              _theme: string
            }
            Returns: string
          }
        | {
            Args: {
              _child_age: string
              _child_name: string
              _child_photo_path?: string
              _customer_email: string
              _has_supporting_character: boolean
              _selected_addons: Json
              _strength: string
              _supporting_character_name: string
              _supporting_character_photo_path?: string
              _theme: string
            }
            Returns: string
          }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_order_status: {
        Args: { _order_id: string }
        Returns: {
          child_name: string
          customer_email: string
          has_audiobook: boolean
          has_error: boolean
          id: string
          pdf_url: string
          status: string
          story_title: string
        }[]
      }
      is_pending_order: { Args: { _order_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
