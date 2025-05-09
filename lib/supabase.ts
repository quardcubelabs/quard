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

// Helper to determine cookie domain based on environment
const getCookieDomain = (): string | undefined => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // In production, use the domain without www
      return 'quardcubelabs-three.vercel.app'
    }
  }
  // Don't set domain for localhost
  return undefined
}

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  const redirectUrl = getBaseUrl()
  const cookieDomain = getCookieDomain()
  
  console.log(`[Supabase] Creating browser client with redirect URL: ${redirectUrl}`)
  if (cookieDomain) {
    console.log(`[Supabase] Using cookie domain: ${cookieDomain}`)
  } else {
    console.log(`[Supabase] Using default cookie domain (localhost)`)
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      storage: {
        getItem: (key) => {
          try {
            // First try to get from localStorage
            const storedData = globalThis.localStorage?.getItem(key) ?? null
            if (storedData) {
              console.log(`[Supabase] Retrieved session from localStorage`)
              return storedData
            }
            
            // If not in localStorage, try to get from cookies
            const cookies = document.cookie.split(';')
            const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
            if (cookie) {
              console.log(`[Supabase] Retrieved session from cookies`)
              return decodeURIComponent(cookie.split('=')[1])
            }
            
            return null
          } catch (error) {
            console.error(`[Supabase] Error getting storage item: ${error}`)
            return null
          }
        },
        setItem: (key, value) => {
          try {
            // Store in both localStorage and cookies for redundancy
            globalThis.localStorage?.setItem(key, value)
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`
            console.log(`[Supabase] Stored session in localStorage and cookies`)
          } catch (error) {
            console.error(`[Supabase] Error setting storage item: ${error}`)
          }
        },
        removeItem: (key) => {
          try {
            globalThis.localStorage?.removeItem(key)
            document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`
            console.log(`[Supabase] Removed session from localStorage and cookies`)
          } catch (error) {
            console.error(`[Supabase] Error removing storage item: ${error}`)
          }
        }
      }
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
        storage: {
          getItem: (key) => {
            try {
              return cookieOptions.cookies().get(key) ?? null
            } catch (error) {
              console.error(`[Supabase] Error getting cookie: ${error}`)
              return null
            }
          },
          setItem: (key, value) => {
            try {
              cookieOptions.cookies().set(key, value, {
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
              })
            } catch (error) {
              console.error(`[Supabase] Error setting cookie: ${error}`)
            }
          },
          removeItem: (key) => {
            try {
              cookieOptions.cookies().set(key, '', {
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 0
              })
            } catch (error) {
              console.error(`[Supabase] Error removing cookie: ${error}`)
            }
          }
        }
      }
    })
  } else {
    // If no cookies provided, use service role key (for admin operations)
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    return createClient(supabaseUrl, supabaseServiceKey)
  }
}
