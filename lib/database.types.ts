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
      user_profiles: {
        Row: {
          id: number
          user_id: string
          email: string
          name: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          updated_at: string
        }
        Update: {
          id?: number
          user_id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          country?: string | null
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