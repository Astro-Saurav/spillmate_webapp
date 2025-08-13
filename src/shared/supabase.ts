import { createClient } from '@supabase/supabase-js'

// These will be injected by the Cloudflare Worker
declare global {
  interface Window {
    __SUPABASE_URL__?: string;
    __SUPABASE_ANON_KEY__?: string;
  }
}

// Get Supabase configuration with proper fallbacks
function getSupabaseConfig() {
  // In browser environment
  if (typeof window !== 'undefined') {
    const injectedUrl = window.__SUPABASE_URL__
    const injectedKey = window.__SUPABASE_ANON_KEY__
    
    // Use injected values first, then Vite env vars, then fallback
    const url = injectedUrl && injectedUrl.trim() !== '' 
      ? injectedUrl 
      : import.meta.env?.VITE_SUPABASE_URL || 'https://uvwumljcocwadrnfruul.supabase.co'
      
    const key = injectedKey && injectedKey.trim() !== '' 
      ? injectedKey 
      : import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2d3VtbGpjb2N3YWRybmZrdXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTQxNDYsImV4cCI6MjA3MDU5MDE0Nn0.1nExsteEj77IvJEOjZ8o_RouL9Nwu3DAFL5sZUX0PKg'
    
    return { url, key }
  }
  
  // Server-side environment - use fallback values
  return {
    url: 'https://uvwumljcocwadrnfruul.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2d3VtbGpjb2N3YWRybmZrdXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTQxNDYsImV4cCI6MjA3MDU5MDE0Nn0.1nExsteEj77IvJEOjZ8o_RouL9Nwu3DAFL5sZUX0PKg'
  }
}

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

// Validate configuration
if (!supabaseUrl || supabaseUrl.trim() === '') {
  throw new Error('Supabase URL is required but not provided')
}

if (!supabaseKey || supabaseKey.trim() === '') {
  throw new Error('Supabase anonymous key is required but not provided')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'free_user' | 'premium_user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'free_user' | 'premium_user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'free_user' | 'premium_user' | 'admin'
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          messages: any[]
          mood_before: number | null
          mood_after: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          messages?: any[]
          mood_before?: number | null
          mood_after?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          messages?: any[]
          mood_before?: number | null
          mood_after?: number | null
          updated_at?: string
        }
      }
      mood_logs: {
        Row: {
          id: string
          user_id: string
          mood_rating: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_rating: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          mood_rating?: number
          notes?: string | null
        }
      }
    }
  }
}
