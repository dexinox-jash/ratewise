export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          payment_method: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_start: string | null
          current_period_end: string | null
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_start?: string | null
          current_period_end?: string | null
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_start?: string | null
          current_period_end?: string | null
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          id: string
          product_id: string | null
          active: boolean | null
          description: string | null
          unit_amount: number | null
          currency: string | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          trial_period_days: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          active: boolean | null
          name: string | null
          description: string | null
          image: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calculations: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          inputs: Json
          results: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          inputs: Json
          results: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          inputs?: Json
          results?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Specific table types
export type User = Tables<'users'>
export type Subscription = Tables<'subscriptions'>
export type Price = Tables<'prices'>
export type Product = Tables<'products'>
export type Calculation = Tables<'calculations'>
