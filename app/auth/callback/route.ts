import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  if (error) {
    console.error("OAuth Error:", error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "Authentication failed")}`
    )
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient()

      try {
        // Exchange the code for a session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (authError) {
          console.error("Auth Error:", authError)
          return NextResponse.redirect(
            `${requestUrl.origin}/auth/login?error=auth_error&message=${encodeURIComponent(authError.message)}`
          )
        }

        // Make sure we have a session
        if (!data?.session) {
          console.error("No session returned from exchangeCodeForSession")
          return NextResponse.redirect(
            `${requestUrl.origin}/auth/login?error=no_session&message=${encodeURIComponent("Failed to create session")}`
          )
        }

        // Store user data if it's a new registration
        if (data.user) {
          // Store user profile in database if needed
          try {
            // Only include essential user data to avoid memory issues
            const userData = {
              user_id: data.user.id,
              email: data.user.email || '',
              updated_at: new Date().toISOString()
            };
            
            // Only add fields that exist
            if (data.user.user_metadata?.name) {
              userData['name'] = data.user.user_metadata.name;
            } else if (data.user.user_metadata?.full_name) {
              userData['name'] = data.user.user_metadata.full_name;
            }
            
            if (data.user.user_metadata?.avatar_url) {
              userData['avatar_url'] = data.user.user_metadata.avatar_url;
            }
            
            try {
              // Check if user profile exists
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', data.user.id)
                .maybeSingle();
              
              if (!existingProfile) {
                // If this is a new user, add creation timestamp
                userData['created_at'] = new Date().toISOString();
              }
            } catch (profileCheckError) {
              console.error("Error checking existing profile:", profileCheckError);
              // Continue with user creation even if profile check fails
              userData['created_at'] = new Date().toISOString();
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
        
        return NextResponse.redirect(requestUrl.origin)
      } catch (authProcessError) {
        console.error("Error processing authentication:", authProcessError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=auth_process_error&message=${encodeURIComponent("Error processing authentication")}`
        )
      }
    } catch (error) {
      console.error("Unexpected Error:", error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=unexpected_error&message=${encodeURIComponent("An unexpected error occurred")}`
      )
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/auth/login?error=no_code&message=${encodeURIComponent("No authentication code provided")}`
  )
}
