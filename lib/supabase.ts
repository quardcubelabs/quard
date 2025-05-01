import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

// Define the production URL
const PRODUCTION_URL = "https://quardcubelabs-three.vercel.app"

// Helper function to get the appropriate base URL
const getBaseUrl = () => {
  // In production, use the Vercel deployment URL
  // In development, use the current origin
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin
    }
  }
  return PRODUCTION_URL
}

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  const redirectUrl = getBaseUrl()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'quardcubelabs'
      }
    }
  })
}

// Create a single supabase client for server components with cookie support
export const createServerClient = (cookieOptions?: { cookies: () => { get: (name: string) => string | undefined; set: (name: string, value: string, options: CookieOptions) => void } }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (cookieOptions) {
    // If cookies are provided, use them for auth
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // This must be false for server-side rendering
        cookies: cookieOptions.cookies
      }
    })
  } else {
    // If no cookies provided, use service role key (for admin operations)
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    return createClient(supabaseUrl, supabaseServiceKey)
  }
}
