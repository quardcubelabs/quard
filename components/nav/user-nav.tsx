'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Define the production URL
const PRODUCTION_URL = "https://quardcubelabs-three.vercel.app"

export default function UserNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)
  
  // Initialize Supabase client on the client-side only
  useEffect(() => {
    // Only create the client on the client side
    const cookieDomain = typeof window !== 'undefined' && 
      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
        ? 'quardcubelabs-three.vercel.app'
        : undefined
    
    console.log(`[UserNav] Initializing with domain: ${cookieDomain || 'default (localhost)'}`)
    
    const supabaseClient = createClientComponentClient<Database>()
    setSupabase(supabaseClient)
  }, [])

  // Handle authentication state when the client is available
  useEffect(() => {
    // Skip if supabase client isn't initialized yet
    if (!supabase) return
    
    const getUser = async () => {
      try {
        console.log("[UserNav] Checking for user session")
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[UserNav] Error getting session:', error)
          setUser(null)
          setLoading(false)
          return
        }
        
        const session = data?.session
        console.log("[UserNav] Session found:", !!session)
        
        if (session?.user) {
          setUser(session.user)
          console.log("[UserNav] User authenticated:", session.user.email)
        } else {
          console.log("[UserNav] No session found")
          setUser(null)
        }
      } catch (error) {
        console.error('[UserNav] Unexpected error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log(`[UserNav] Auth state changed: ${event}`)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("[UserNav] User signed in:", session.user.email)
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log("[UserNav] User signed out")
          setUser(null)
        }
      }
    )
    
    return () => {
      if (authListener?.subscription) {
        console.log("[UserNav] Unsubscribing from auth changes")
        authListener.subscription.unsubscribe()
      }
    }
  }, [supabase])
  
  const handleSignOut = async () => {
    if (!supabase) return
    
    try {
      console.log("[UserNav] Signing out user")
      await supabase.auth.signOut()
      
      // Use appropriate redirect for the environment
      const redirectUrl = typeof window !== 'undefined' && 
        (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
          ? PRODUCTION_URL
          : "/"
      
      console.log(`[UserNav] Redirecting to ${redirectUrl}`)
      window.location.href = redirectUrl
    } catch (error) {
      console.error('[UserNav] Error signing out:', error)
    }
  }
  
  return (
    <div className="flex items-center gap-4">
      {!loading ? (
        <>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/account" className="text-sm font-medium hover:underline">
                Account
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Sign Out
              </button>
              {user.user_metadata?.avatar_url && (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
          )}
        </>
      ) : (
        <span className="text-sm text-gray-500">Loading...</span>
      )}
    </div>
  )
} 