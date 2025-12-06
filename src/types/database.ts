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
      emails: {
        Row: {
          id: string
          recipient: string
          sender: string
          subject: string
          body_html: string | null
          body_text: string | null
          created_at: string
          expires_at: string
          is_read: boolean
          is_custom_domain: boolean
        }
        Insert: {
          id?: string
          recipient: string
          sender: string
          subject: string
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          expires_at: string
          is_read?: boolean
          is_custom_domain?: boolean
        }
        Update: {
          id?: string
          recipient?: string
          sender?: string
          subject?: string
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          expires_at?: string
          is_read?: boolean
          is_custom_domain?: boolean
        }
      }
      attachments: {
        Row: {
          id: string
          email_id: string
          filename: string
          content_type: string
          size: number
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          email_id: string
          filename: string
          content_type: string
          size: number
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          email_id?: string
          filename?: string
          content_type?: string
          size?: number
          storage_path?: string
          created_at?: string
        }
      }
      custom_domains_usage: {
        Row: {
          id: string
          domain: string
          first_seen: string
          last_used: string
          total_emails_received: number
        }
        Insert: {
          id?: string
          domain: string
          first_seen?: string
          last_used?: string
          total_emails_received?: number
        }
        Update: {
          id?: string
          domain?: string
          first_seen?: string
          last_used?: string
          total_emails_received?: number
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
