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

export function subscribeToProjectsRealtime(onChange: () => void): () => void {
  if (!supabaseClient) return () => {}

  try {
    const channel = supabaseClient
      .channel('portfolio-projects-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          onChange()
        },
      )
      .subscribe()

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  } catch {
    return () => {}
  }
}
