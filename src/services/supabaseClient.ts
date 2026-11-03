import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isFrontendSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('sample-portfolio-id') &&
    !supabaseUrl.includes('your-supabase-project-id') &&
    !supabaseAnonKey.includes('sample-anon-key') &&
    !supabaseAnonKey.includes('your-supabase-anon-key-here'),
)

export const supabaseClient: SupabaseClient | null = isFrontendSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const supabase = supabaseClient
