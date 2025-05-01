import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

// This middleware runs on every request to the site
export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()
  
  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Refresh the session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // URLs that require authentication
  const protectedRoutes = ['/account', '/orders']
  // URLs that should redirect to the home page if already authenticated (auth pages)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  // URLs that skip middleware checks
  const publicRoutes = ['/api', '/_next', '/static', '/favicon.ico', '/auth/callback']
  
  // Get the pathname from the URL
  const { pathname } = req.nextUrl

  // Skip middleware for public routes and API requests
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return res
  }

  // If user is signed in and trying to access an auth page, redirect to home
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is not signed in and trying to access a protected page, redirect to login
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth/login', req.url)
    // Add the requested URL as a query parameter so we can redirect after login
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Only run middleware on the following paths to avoid unnecessary function calls
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 