import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from '@/lib/database.types'

// Define the production URL
const PRODUCTION_URL = "https://quardcubelabs-three.vercel.app"

// Define user data type
type UserProfileData = {
  user_id: string
  email: string
  name?: string
  avatar_url?: string
  updated_at: string
  created_at?: string
  [key: string]: string | undefined
}

// Helper function to get the appropriate base URL
const getRedirectURL = (requestUrl: URL): string => {
  // Use production URL in production environment, original origin in development
  if (process.env.NODE_ENV === 'production' || 
      requestUrl.hostname !== 'localhost' && requestUrl.hostname !== '127.0.0.1') {
    return PRODUCTION_URL
  }
  return requestUrl.origin
}

// Helper to determine domain for cookie settings
const getCookieDomain = (requestUrl: URL): string | undefined => {
  // Only set domain in production and when not on localhost
  if (process.env.NODE_ENV === 'production' && 
      requestUrl.hostname !== 'localhost' && 
      requestUrl.hostname !== '127.0.0.1') {
    return requestUrl.hostname
  }
  return undefined
}

export async function GET(request: Request) {
  try {
    console.log("[Callback] Auth callback route triggered")
    const requestUrl = new URL(request.url)
    console.log("[Callback] Request URL:", requestUrl.toString())
    
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")
    const redirectBase = getRedirectURL(requestUrl)
    const cookieDomain = getCookieDomain(requestUrl)
    
    if (code) {
      console.log("[Callback] Auth code present:", code.substring(0, 10) + "...")
    }
    
    if (error) {
      console.error("[Callback] OAuth Error:", error, errorDescription)
      return NextResponse.redirect(
        `${redirectBase}/auth/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "Authentication failed")}`
      )
    }

    if (code) {
      try {
        // Use the createRouteHandlerClient which properly handles Next.js cookies
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient<Database>({ 
          cookies: () => cookieStore 
        }, {
          cookieOptions: {
            domain: cookieDomain,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          }
        })
        
        try {
          console.log("[Callback] Exchanging code for session...")
          
          // Get the code verifier from the cookie
          const codeVerifier = cookieStore.get('code_verifier')?.value
          
          if (!codeVerifier) {
            console.error("[Callback] No code verifier found in cookies")
            return NextResponse.redirect(
              `${redirectBase}/auth/login?error=no_code_verifier&message=${encodeURIComponent("No code verifier found")}`
            )
          }
          
          // Exchange the code for a session - this will automatically set the cookies
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (sessionError) {
            console.error("[Callback] Session exchange error:", sessionError)
            return NextResponse.redirect(
              `${redirectBase}/auth/login?error=session_exchange_error&message=${encodeURIComponent(sessionError.message)}`
            )
          }
          
          if (!data?.session) {
            console.error("[Callback] No session returned from code exchange")
            return NextResponse.redirect(
              `${redirectBase}/auth/login?error=no_session&message=${encodeURIComponent("No session returned from code exchange")}`
            )
          }
          
          console.log("[Callback] Session created successfully for user:", data.session.user.id)
          
          // Create a response with custom cookie settings
          const response = NextResponse.redirect(`${redirectBase}`)
          
          // Clear the code verifier cookie
          response.cookies.set('code_verifier', '', {
            domain: cookieDomain,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
          })
          
          // Set the session cookie with proper options
          response.cookies.set('sb-auth-token', data.session.access_token, {
            domain: cookieDomain,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
          
          // Set the refresh token cookie
          if (data.session.refresh_token) {
            response.cookies.set('sb-refresh-token', data.session.refresh_token, {
              domain: cookieDomain,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 24 * 30 // 30 days
            })
          }
          
          console.log(`[Callback] Auth completed, redirecting to ${redirectBase}`)
          console.log(`[Callback] Cookie domain: ${cookieDomain || 'default (localhost)'}`)
          console.log(`[Callback] Session expires at: ${new Date(data.session.expires_at! * 1000).toISOString()}`)
          
          return response
          
        } catch (authProcessError) {
          console.error("[Callback] Error processing authentication:", authProcessError)
          return NextResponse.redirect(
            `${redirectBase}/auth/login?error=auth_process_error&message=${encodeURIComponent("Error processing authentication")}`
          )
        }
      } catch (error) {
        console.error("[Callback] Unexpected Error:", error)
        return NextResponse.redirect(
          `${redirectBase}/auth/login?error=unexpected_error&message=${encodeURIComponent("An unexpected error occurred")}`
        )
      }
    } else {
      console.error("[Callback] No auth code provided in URL")
    }

    return NextResponse.redirect(
      `${redirectBase}/auth/login?error=no_code&message=${encodeURIComponent("No authentication code provided")}`
    )
  } catch (generalError) {
    console.error("[Callback] General error in callback route:", generalError)
    return NextResponse.redirect(
      `${PRODUCTION_URL}/auth/login?error=general_error&message=${encodeURIComponent("An unexpected error occurred in the auth callback")}`
    )
  }
}
