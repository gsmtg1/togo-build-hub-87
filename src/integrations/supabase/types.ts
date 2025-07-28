export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounting_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      accounting_entries: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      brick_types: {
        Row: {
          created_at: string | null
          dimensions: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dimensions: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dimensions?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_templates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          brick_type_id: string | null
          created_at: string | null
          current_amount: number | null
          current_quantity: number | null
          description: string | null
          id: string
          month: number
          status: string | null
          target_amount: number | null
          target_quantity: number
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          brick_type_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          current_quantity?: number | null
          description?: string | null
          id?: string
          month: number
          status?: string | null
          target_amount?: number | null
          target_quantity: number
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          brick_type_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          current_quantity?: number | null
          description?: string | null
          id?: string
          month?: number
          status?: string | null
          target_amount?: number | null
          target_quantity?: number
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_goals_brick_type_id_fkey"
            columns: ["brick_type_id"]
            isOneToOne: false
            referencedRelation: "brick_types"
            referencedColumns: ["id"]
          },
        ]
      }
      production_costs: {
        Row: {
          brick_type_id: string | null
          calculated_cost: number
          calculation_date: string | null
          id: string
          notes: string | null
        }
        Insert: {
          brick_type_id?: string | null
          calculated_cost: number
          calculation_date?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          brick_type_id?: string | null
          calculated_cost?: number
          calculation_date?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_costs_brick_type_id_fkey"
            columns: ["brick_type_id"]
            isOneToOne: false
            referencedRelation: "brick_types"
            referencedColumns: ["id"]
          },
        ]
      }
      production_materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          unit: string
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          unit: string
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          unit?: string
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      production_recipes: {
        Row: {
          brick_type_id: string | null
          created_at: string | null
          id: string
          material_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          brick_type_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          brick_type_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_recipes_brick_type_id_fkey"
            columns: ["brick_type_id"]
            isOneToOne: false
            referencedRelation: "brick_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "production_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          actif: boolean
          categorie: string
          created_at: string
          date_creation: string
          hauteur_cm: number
          id: string
          largeur_cm: number
          longueur_cm: number
          nom: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          categorie: string
          created_at?: string
          date_creation?: string
          hauteur_cm: number
          id?: string
          largeur_cm: number
          longueur_cm: number
          nom: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          categorie?: string
          created_at?: string
          date_creation?: string
          hauteur_cm?: number
          id?: string
          largeur_cm?: number
          longueur_cm?: number
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          error_message: string | null
          id: string
          last_sync: string | null
          sync_status: string | null
          table_name: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          last_sync?: string | null
          sync_status?: string | null
          table_name: string
        }
        Update: {
          error_message?: string | null
          id?: string
          last_sync?: string | null
          sync_status?: string | null
          table_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
