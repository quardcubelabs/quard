'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/database.types'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    // Fetch the user's session
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error fetching user:', error)
          return
        }
        
        if (user) {
          setUser(user)
          
          // Also fetch user profile data
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single()
              
            if (profileError) {
              console.error('Error fetching user profile:', profileError)
            } else if (profile) {
              setUser(prevUser => ({
                ...prevUser,
                profile
              }))
            }
          } catch (profileFetchError) {
            console.error('Error in profile fetch:', profileFetchError)
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [supabase])
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="mb-4">You need to sign in to access this page.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account Information</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">User ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          {user.user_metadata?.name && (
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{user.user_metadata.name}</p>
            </div>
          )}
          {user.user_metadata?.full_name && (
            <div>
              <p className="text-gray-600">Full Name</p>
              <p className="font-medium">{user.user_metadata.full_name}</p>
            </div>
          )}
          {user.profile && (
            <>
              <div className="col-span-2 mt-4">
                <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
              </div>
              {user.profile.name && (
                <div>
                  <p className="text-gray-600">Profile Name</p>
                  <p className="font-medium">{user.profile.name}</p>
                </div>
              )}
              {user.profile.avatar_url && (
                <div>
                  <p className="text-gray-600">Avatar</p>
                  <img 
                    src={user.profile.avatar_url} 
                    alt="User Avatar" 
                    className="w-16 h-16 rounded-full object-cover mt-1"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
} 