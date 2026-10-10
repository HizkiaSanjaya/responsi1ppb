import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    const err = new Error(
      'Supabase belum dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY pada environment variables.'
    )
    err.statusCode = 503
    throw err
  }
  return supabase
}
