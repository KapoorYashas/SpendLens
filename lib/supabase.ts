// ============================================================
// SpendLens — Supabase client factory
// Exports lazy factory functions — clients are created on first call,
// not at module import time. This prevents build-time env var errors.
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton for the public anon client
let _anonClient: SupabaseClient | null = null

/**
 * Public anon client — safe for client-side use, respects RLS.
 * Created lazily on first call to avoid build-time env var requirements.
 */
export function getAnonClient(): SupabaseClient {
  if (_anonClient) return _anonClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Copy .env.example to .env.local and fill in:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  _anonClient = createClient(url, key)
  return _anonClient
}

/**
 * Service role client — bypasses RLS, server-side only.
 * Creates a new instance per call (not a singleton) as it should only be used server-side.
 */
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing server-side Supabase env vars:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL\n' +
      '  SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Convenience re-export — use in server components where you have env vars available
// Calling .from() on this will call getAnonClient() lazily
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getAnonClient()[prop as keyof SupabaseClient]
  },
})
