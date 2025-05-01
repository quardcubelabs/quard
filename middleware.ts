import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

// Define the production URL
const PRODUCTION_URL = "https://quardcubelabs-three.vercel.app"

// Helper to determine domain for cookie settings
const getCookieDomain = (req: NextRequest): string | undefined => {
  const { hostname } = req.nextUrl
  if (process.env.NODE_ENV === 'production' || 
      hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // In production, use the Vercel domain
    return 'quardcubelabs-three.vercel.app'
  }
  // Don't set domain for localhost
  return undefined
}

// This middleware runs on every request to the site
export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()
  
  // Get the cookie domain based on environment
  const cookieDomain = getCookieDomain(req)
  
  // Create a Supabase client for the middleware with proper cookie options
  const supabase = createMiddlewareClient<Database>(
    { req, res },
    {
      cookieOptions: {
        // These options are essential for cookies to work in production
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  )
  
  // Refresh the session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Log authentication status for debugging
  console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Authenticated: ${!!session}`)

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