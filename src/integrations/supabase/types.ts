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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_online: boolean
          name: string
          slug: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean
          name: string
          slug?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean
          name?: string
          slug?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_paid: boolean
          sale_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_paid?: boolean
          sale_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_paid?: boolean
          sale_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_store_info: {
        Row: {
          created_at: string
          id: string
          images: Json
          is_featured: boolean
          is_online: boolean
          product_id: string
          promo_price: number | null
          short_description: string | null
          slug: string
          sort_order: number
          store_description: string | null
          store_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          images?: Json
          is_featured?: boolean
          is_online?: boolean
          product_id: string
          promo_price?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number
          store_description?: string | null
          store_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          images?: Json
          is_featured?: boolean
          is_online?: boolean
          product_id?: string
          promo_price?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          store_description?: string | null
          store_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_store_info_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number
          created_at: string
          current_stock: number
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          min_stock: number
          name: string
          sell_price: number
          sku: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost_price?: number
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          name: string
          sell_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost_price?: number
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          name?: string
          sell_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          discount: number
          id: string
          notes: string | null
          payment_method: string
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_customers: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_district: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          created_at: string
          customer_id: string | null
          document: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_district?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          created_at?: string
          customer_id?: string | null
          document?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_district?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          created_at?: string
          customer_id?: string | null
          document?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount: number
          id: string
          notes: string | null
          order_number: number
          payment_method: string
          payment_reference: string | null
          payment_status: string
          processed_at: string | null
          sale_id: string | null
          shipping_address: Json
          shipping_cost: number
          status: string
          store_customer_id: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          processed_at?: string | null
          sale_id?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          store_customer_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          processed_at?: string | null
          sale_id?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          store_customer_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_store_customer_id_fkey"
            columns: ["store_customer_id"]
            isOneToOne: false
            referencedRelation: "store_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          about_text: string | null
          announcement: string | null
          created_at: string
          email: string | null
          free_shipping_threshold: number | null
          hero_banners: Json
          id: string
          instagram_url: string | null
          is_open: boolean
          logo_url: string | null
          payment_config: Json
          payment_instructions: string | null
          payment_provider: string
          phone: string | null
          shipping_flat_rate: number
          store_name: string
          tagline: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          announcement?: string | null
          created_at?: string
          email?: string | null
          free_shipping_threshold?: number | null
          hero_banners?: Json
          id?: string
          instagram_url?: string | null
          is_open?: boolean
          logo_url?: string | null
          payment_config?: Json
          payment_instructions?: string | null
          payment_provider?: string
          phone?: string | null
          shipping_flat_rate?: number
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          announcement?: string | null
          created_at?: string
          email?: string | null
          free_shipping_threshold?: number | null
          hero_banners?: Json
          id?: string
          instagram_url?: string | null
          is_open?: boolean
          logo_url?: string | null
          payment_config?: Json
          payment_instructions?: string | null
          payment_provider?: string
          phone?: string | null
          shipping_flat_rate?: number
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      process_store_order: { Args: { _order_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "manager" | "seller"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "manager", "seller"],
    },
  },
} as const
