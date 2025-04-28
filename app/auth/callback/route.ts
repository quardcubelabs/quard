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
    const cookieStore = cookies()
    const supabase = createServerClient()

    try {
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error("Auth Error:", authError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=auth_error&message=${encodeURIComponent(authError.message)}`
        )
      }

      return NextResponse.redirect(requestUrl.origin)
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
