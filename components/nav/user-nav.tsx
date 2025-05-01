'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export default function UserNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error fetching user:', error)
        }
        setUser(user)
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`)
      setUser(session?.user || null)
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  return (
    <div className="flex items-center gap-4">
      {!loading && (
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
      )}
    </div>
  )
} 