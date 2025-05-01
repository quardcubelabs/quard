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
  if (process.env.NODE_ENV === 'production' || 
      requestUrl.hostname !== 'localhost' && requestUrl.hostname !== '127.0.0.1') {
    // In production, use the Vercel domain
    return 'quardcubelabs-three.vercel.app'
  }
  // Don't set domain for localhost
  return undefined
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const redirectBase = getRedirectURL(requestUrl)
  const cookieDomain = getCookieDomain(requestUrl)

  if (error) {
    console.error("OAuth Error:", error, errorDescription)
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
        // These options help ensure cookies are correctly set in production
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          cookieOptions: {
            // Essential for proper cookie setting in production
            domain: cookieDomain,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          }
        }
      })
      
      try {
        // Exchange the code for a session - this will automatically set the cookies
        await supabase.auth.exchangeCodeForSession(code)
        
        // Log the cookie for debugging
        console.log("Auth cookies set:", cookieStore.getAll()
          .filter(cookie => cookie.name.includes('supabase'))
          .map(c => `${c.name}=${c.value.substring(0, 10)}...`)
        )
        
        // Get user profile to check if we need to create one
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error("Error getting user:", userError)
          return NextResponse.redirect(
            `${redirectBase}/auth/login?error=user_error&message=${encodeURIComponent("Failed to get user data")}`
          )
        }

        // Create or update user profile if we have a user
        if (user) {
          try {
            // Only include essential user data to avoid memory issues
            const userData: UserProfileData = {
              user_id: user.id,
              email: user.email || '',
              updated_at: new Date().toISOString()
            };
            
            // Only add fields that exist
            if (user.user_metadata?.name) {
              userData.name = user.user_metadata.name;
            } else if (user.user_metadata?.full_name) {
              userData.name = user.user_metadata.full_name;
            }
            
            if (user.user_metadata?.avatar_url) {
              userData.avatar_url = user.user_metadata.avatar_url;
            }
            
            try {
              // Check if user profile exists
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (!existingProfile) {
                // If this is a new user, add creation timestamp
                userData.created_at = new Date().toISOString();
              }
            } catch (profileCheckError) {
              console.error("Error checking existing profile:", profileCheckError);
              // Continue with user creation even if profile check fails
              userData.created_at = new Date().toISOString();
            }
            
            try {
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert(userData, { onConflict: 'user_id' });

              if (profileError) {
                console.error("Error storing user profile:", profileError);
              }
            } catch (upsertError) {
              console.error("Error upserting user profile:", upsertError);
            }
          } catch (profileStoreError) {
            console.error("Error in profile storage:", profileStoreError);
            // Continue even if profile storage fails - authentication still worked
          }
        }

        // Create a custom response with explicit cookie handling for production
        const response = NextResponse.redirect(`${redirectBase}`)
        
        // Copy cookies from cookieStore to the response with production-friendly settings
        const supabaseCookies = cookieStore.getAll()
        for (const cookie of supabaseCookies) {
          if (cookie.name.includes('supabase')) {
            // Use production-friendly cookie settings
            response.cookies.set({
              name: cookie.name,
              value: cookie.value,
              domain: cookieDomain,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: cookie.httpOnly,
              maxAge: 60 * 60 * 24 * 7, // 1 week
            })
          }
        }
        
        return response
        
      } catch (authProcessError) {
        console.error("Error processing authentication:", authProcessError)
        return NextResponse.redirect(
          `${redirectBase}/auth/login?error=auth_process_error&message=${encodeURIComponent("Error processing authentication")}`
        )
      }
    } catch (error) {
      console.error("Unexpected Error:", error)
      return NextResponse.redirect(
        `${redirectBase}/auth/login?error=unexpected_error&message=${encodeURIComponent("An unexpected error occurred")}`
      )
    }
  }

  return NextResponse.redirect(
    `${redirectBase}/auth/login?error=no_code&message=${encodeURIComponent("No authentication code provided")}`
  )
}
