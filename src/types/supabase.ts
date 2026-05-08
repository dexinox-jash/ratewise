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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          timezone: string | null
          primary_skills: string[] | null
          subscription_tier: string
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          email_notifications: boolean
          marketing_emails: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string | null
          primary_skills?: string[] | null
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          email_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string | null
          primary_skills?: string[] | null
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          email_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      calculations: {
        Row: {
          id: string
          user_id: string | null
          input_data: Json
          result_data: Json
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          input_data: Json
          result_data: Json
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          input_data?: Json
          result_data?: Json
          is_anonymous?: boolean
          created_at?: string
        }
      }
      rate_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          skills: string[]
          experience_level: string
          years_of_experience: number
          location: string
          industry: string | null
          project_complexity: string | null
          currency: string
          hourly_rate: Json | null
          is_public: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          skills: string[]
          experience_level: string
          years_of_experience?: number
          location: string
          industry?: string | null
          project_complexity?: string | null
          currency?: string
          hourly_rate?: Json | null
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          skills?: string[]
          experience_level?: string
          years_of_experience?: number
          location?: string
          industry?: string | null
          project_complexity?: string | null
          currency?: string
          hourly_rate?: Json | null
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
