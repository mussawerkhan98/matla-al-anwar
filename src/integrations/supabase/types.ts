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
      industries: {
        Row: {
          content_html: string
          created_at: string
          description: string
          id: string
          image_alt: string | null
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          content_html?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          arabic: string
          blurb: string
          body_content: string
          created_at: string
          google_maps_url: string | null
          h1_override: string | null
          id: string
          map_x: number
          map_y: number
          meta_description: string | null
          meta_title: string | null
          name: string
          neighborhoods: string
          response_time: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          arabic?: string
          blurb?: string
          body_content?: string
          created_at?: string
          google_maps_url?: string | null
          h1_override?: string | null
          id?: string
          map_x?: number
          map_y?: number
          meta_description?: string | null
          meta_title?: string | null
          name: string
          neighborhoods?: string
          response_time?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          arabic?: string
          blurb?: string
          body_content?: string
          created_at?: string
          google_maps_url?: string | null
          h1_override?: string | null
          id?: string
          map_x?: number
          map_y?: number
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          neighborhoods?: string
          response_time?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content_html: string
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content_html?: string
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content_html?: string
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          blog_post_slug: string | null
          created_at: string
          id: string
          pages: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          blog_post_slug?: string | null
          created_at?: string
          id?: string
          pages?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          blog_post_slug?: string | null
          created_at?: string
          id?: string
          pages?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      fleet_vehicles: {
        Row: {
          alt_text: string | null
          capacity: string
          category: string
          created_at: string
          currency: string
          id: string
          ideal: string
          image_url: string | null
          name: string
          related_link_label: string | null
          related_link_url: string | null
          slug: string
          sort_order: number
          starting_price: number | null
          temp_range: string
          updated_at: string
          volume: string
        }
        Insert: {
          alt_text?: string | null
          capacity: string
          category: string
          created_at?: string
          currency?: string
          id?: string
          ideal: string
          image_url?: string | null
          name: string
          related_link_label?: string | null
          related_link_url?: string | null
          slug: string
          sort_order?: number
          starting_price?: number | null
          temp_range: string
          updated_at?: string
          volume: string
        }
        Update: {
          alt_text?: string | null
          capacity?: string
          category?: string
          created_at?: string
          currency?: string
          id?: string
          ideal?: string
          image_url?: string | null
          name?: string
          related_link_label?: string | null
          related_link_url?: string | null
          slug?: string
          sort_order?: number
          starting_price?: number | null
          temp_range?: string
          updated_at?: string
          volume?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          content_html: string
          created_at: string
          description: string
          h1_override: string | null
          icon: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content_html?: string
          created_at?: string
          description: string
          h1_override?: string | null
          icon?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          description?: string
          h1_override?: string | null
          icon?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt: string | null
          id: string
          image_url: string | null
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          alt?: string | null
          id?: string
          image_url?: string | null
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          alt?: string | null
          id?: string
          image_url?: string | null
          key?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          body: string
          created_at: string
          heading: string
          icon: string | null
          id: string
          page_slug: string
          section_key: string
          sort_order: number
          subheading: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          heading?: string
          icon?: string | null
          id?: string
          page_slug: string
          section_key: string
          sort_order?: number
          subheading?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          heading?: string
          icon?: string | null
          id?: string
          page_slug?: string
          section_key?: string
          sort_order?: number
          subheading?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
