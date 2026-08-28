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
    PostgrestVersion: "14.17"
  }
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
  public: {
    Tables: {
      albums: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          expires_at: string | null
          id: string
          is_system_default: boolean | null
          name: string
          slug: string
          time_limit_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_system_default?: boolean | null
          name: string
          slug: string
          time_limit_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_system_default?: boolean | null
          name?: string
          slug?: string
          time_limit_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      default_event_schedules: {
        Row: {
          created_at: string | null
          event_type_id: string | null
          id: string
          slug: string
          suggested_order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          event_type_id?: string | null
          id?: string
          slug: string
          suggested_order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          event_type_id?: string | null
          id?: string
          slug?: string
          suggested_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_event_schedules_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      default_event_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          event_type_id: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type_id?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type_id?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_event_tasks_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_guests: {
        Row: {
          created_at: string | null
          display_name: string
          event_id: string | null
          id: string
          session_token: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          event_id?: string | null
          id?: string
          session_token: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          event_id?: string | null
          id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_members: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          role: Database["public"]["Enums"]["event_member_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["event_member_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["event_member_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          created_at: string | null
          end_time: string
          event_id: string | null
          id: string
          slug: string
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          event_id?: string | null
          id?: string
          slug: string
          start_time: string
          title: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          event_id?: string | null
          id?: string
          slug?: string
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_settings: {
        Row: {
          allow_videos: boolean | null
          event_id: string
          max_guests: number | null
          max_photos_per_guest: number | null
          require_moderation: boolean | null
        }
        Insert: {
          allow_videos?: boolean | null
          event_id: string
          max_guests?: number | null
          max_photos_per_guest?: number | null
          require_moderation?: boolean | null
        }
        Update: {
          allow_videos?: boolean | null
          event_id?: string
          max_guests?: number | null
          max_photos_per_guest?: number | null
          require_moderation?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_settings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_photo_url: string | null
          created_at: string | null
          custom_type_name: string | null
          event_date: string
          event_type_id: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          slug: string
          status: string | null
          title: string
        }
        Insert: {
          cover_photo_url?: string | null
          created_at?: string | null
          custom_type_name?: string | null
          event_date: string
          event_type_id?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          slug: string
          status?: string | null
          title: string
        }
        Update: {
          cover_photo_url?: string | null
          created_at?: string | null
          custom_type_name?: string | null
          event_date?: string
          event_type_id?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          slug?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          album_id: string | null
          created_at: string | null
          event_id: string | null
          file_path: string
          file_type: string
          file_url: string
          guest_id: string | null
          id: string
          member_id: string | null
          message: string | null
          schedule_id: string | null
          status: boolean | null
          taken_at: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string | null
          event_id?: string | null
          file_path: string
          file_type: string
          file_url: string
          guest_id?: string | null
          id?: string
          member_id?: string | null
          message?: string | null
          schedule_id?: string | null
          status?: boolean | null
          taken_at: string
        }
        Update: {
          album_id?: string | null
          created_at?: string | null
          event_id?: string | null
          file_path?: string
          file_type?: string
          file_url?: string
          guest_id?: string | null
          id?: string
          member_id?: string | null
          message?: string | null
          schedule_id?: string | null
          status?: boolean | null
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "event_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "event_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      media_downloads: {
        Row: {
          created_at: string | null
          guest_id: string | null
          id: string
          media_id: string | null
          member_id: string | null
        }
        Insert: {
          created_at?: string | null
          guest_id?: string | null
          id?: string
          media_id?: string | null
          member_id?: string | null
        }
        Update: {
          created_at?: string | null
          guest_id?: string | null
          id?: string
          media_id?: string | null
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_downloads_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_downloads_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_downloads_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "event_members"
            referencedColumns: ["id"]
          },
        ]
      }
      media_likes: {
        Row: {
          created_at: string | null
          guest_id: string | null
          id: string
          media_id: string | null
          member_id: string | null
        }
        Insert: {
          created_at?: string | null
          guest_id?: string | null
          id?: string
          media_id?: string | null
          member_id?: string | null
        }
        Update: {
          created_at?: string | null
          guest_id?: string | null
          id?: string
          media_id?: string | null
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_likes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_likes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_likes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "event_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_member_role: "ADMIN" | "MEMBER" | "MODERATOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      event_member_role: ["ADMIN", "MEMBER", "MODERATOR"],
    },
  },
} as const
