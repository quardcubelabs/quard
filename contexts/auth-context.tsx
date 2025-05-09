"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { User, Session, AuthError } from "@supabase/supabase-js"

// Define the production URL
const PRODUCTION_URL = "https://quardcubelabs-three.vercel.app"

// Helper function to get the appropriate base URL
const getBaseUrl = () => {
  // Always use the Vercel deployment URL in production
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin
    }
  }
  // Force Vercel URL in production
  return 'https://quardcubelabs-three.vercel.app'
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (data: any) => Promise<{ error: AuthError | null }>
}

// Define types for user data and profile data
type UserData = {
  user_id: string
  email: string | undefined
  name: string
  country?: string
  created_at: string
  updated_at: string
  avatar_url?: string
}

type ProfileData = {
  name?: string
  avatar_url?: string
  country?: string
  street?: string
  city?: string
  state?: string
  postal_code?: string
  phone?: string
  [key: string]: string | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to create a sanitized user object with smaller footprint
const sanitizeUserData = (user: User | null) => {
  if (!user) return null;
  
  try {
    // Just keep essential user data to avoid large object serialization
    return {
      id: user.id,
      email: user.email || '',
      user_metadata: {
        name: user.user_metadata?.name || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        country: user.user_metadata?.country || '',
      },
      app_metadata: {
        provider: user.app_metadata?.provider || '',
      },
      aud: user.aud || '',
      created_at: user.created_at || '',
    } as User;
  } catch (error) {
    console.error("Error sanitizing user data:", error);
    // Return minimal valid user object if sanitization fails
    return {
      id: user.id,
      email: user.email || '',
      created_at: '',
      aud: '',
    } as User;
  }
};

// Safe session handler to prevent unhandled errors
const createSafeSession = (session: Session | null): Session | null => {
  if (!session) return null;
  
  try {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
      expires_in: session.expires_in || 0,
      expires_at: session.expires_at || 0,
      token_type: session.token_type || 'bearer',
      user: sanitizeUserData(session.user),
    } as Session;
  } catch (error) {
    console.error("Error creating safe session:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createBrowserClient())
  const [baseUrl] = useState(() => getBaseUrl())

  useEffect(() => {
    const setData = async () => {
      try {
        console.log("[Auth] Initializing auth state...")
        
        // Get the initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        
        if (error) {
          console.error("[Auth] Error getting initial session:", error)
          return
        }
        
        if (session) {
          console.log("[Auth] Initial session found for user:", session.user.id)
          
          try {
            // Store sanitized user and session to avoid memory issues
            const safeSession = createSafeSession(session);
            if (safeSession) {
              setSession(safeSession);
              setUser(safeSession.user as User);
              console.log("[Auth] Session and user state updated")
            }
          } catch (sessionError) {
            console.error("[Auth] Error processing initial session:", sessionError);
          }
          
          // Also check if user profile exists, if not create it
          if (session.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('id, user_id, email, name')
                .eq('user_id', session.user.id)
                .single();
                
              if (profileError && profileError.code !== 'PGRST116') {
                console.error("[Auth] Error checking user profile:", profileError)
              }
              
              // If no profile exists, create one
              if (!profile) {
                try {
                  const userData: UserData = {
                    user_id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  
                  if (session.user.user_metadata?.avatar_url) {
                    userData.avatar_url = session.user.user_metadata.avatar_url;
                  }
                  
                  const { error: insertError } = await supabase
                    .from('user_profiles')
                    .upsert(userData);
                    
                  if (insertError) {
                    console.error("[Auth] Error creating user profile:", insertError)
                  } else {
                    console.log("[Auth] User profile created successfully")
                  }
                } catch (error) {
                  console.error("[Auth] Error in profile creation:", error)
                }
              } else {
                console.log("[Auth] User profile found")
              }
            } catch (profileCheckError) {
              console.error("[Auth] Error checking for user profile:", profileCheckError);
            }
          }
        } else {
          console.log("[Auth] No initial session found")
        }
      } catch (error) {
        console.error("[Auth] Error in auth initialization:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setData()

    // Set up auth state change listener
    try {
      console.log("[Auth] Setting up auth state change listener")
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[Auth] Auth state changed:", event)
        
        try {
          if (session) {
            console.log("[Auth] New session established for user:", session.user.id)
            
            // Store sanitized user and session data
            const safeSession = createSafeSession(session);
            if (safeSession) {
              setSession(safeSession);
              setUser(safeSession.user as User);
              console.log("[Auth] Session and user state updated after auth change")
            }
            
            // After successful sign-in, redirect to home page
            if (event === 'SIGNED_IN') {
              console.log("[Auth] Redirecting to home after sign in")
              router.push('/')
            }
          } else {
            console.log("[Auth] Session cleared")
            setSession(null)
            setUser(null)
            
            // After sign out, redirect to login page
            if (event === 'SIGNED_OUT') {
              console.log("[Auth] Redirecting to login after sign out")
              router.push('/auth/login')
            }
          }
        } catch (stateChangeError) {
          console.error("[Auth] Error handling auth state change:", stateChangeError);
        } finally {
          setIsLoading(false)
        }
      })

      return () => {
        try {
          console.log("[Auth] Cleaning up auth state change listener")
          subscription.unsubscribe()
        } catch (unsubError) {
          console.error("[Auth] Error unsubscribing from auth state changes:", unsubError);
        }
      }
    } catch (subscriptionError) {
      console.error("[Auth] Error setting up auth state change listener:", subscriptionError);
      setIsLoading(false);
      return () => {}; // Empty cleanup if setup failed
    }
  }, [supabase, router, baseUrl])

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${baseUrl}/auth/callback`,
        },
      })
      
      // If sign up successful and no verification is required, create user profile
      if (!error && data?.user) {
        try {
          const userData: UserData = {
            user_id: data.user.id,
            email: data.user.email || '',
            name: metadata?.name || '',
            country: metadata?.country || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert(userData);
            
          if (profileError) {
            console.error("Error creating user profile after signup:", profileError)
          }
        } catch (profileError) {
          console.error("Error in profile creation after signup:", profileError)
        }
      }
      
      return { error }
    } catch (error: any) {
      console.error("Error in signUp:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!error && data?.user) {
        console.log("Signed in successfully:", data.user.id)
        // Router will handle redirect in the onAuthStateChange listener
      }
      
      setIsLoading(false)
      return { error }
    } catch (error: any) {
      console.error("Error in signIn:", error)
      setIsLoading(false)
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("[Auth] Initiating Google sign-in")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
          flowType: 'pkce'
        },
      })

      if (error) {
        console.error("[Auth] Google sign-in error:", error)
        throw error
      }

      console.log("[Auth] Google sign-in initiated successfully")
    } catch (error: any) {
      console.error("[Auth] Exception during Google sign-in:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred during Google sign in.",
        variant: "destructive",
      })
    }
  }

  const signInWithFacebook = async () => {
    try {
      console.log("[Auth] Initiating Facebook sign-in")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
          flowType: 'pkce'
        },
      })

      if (error) {
        console.error("[Auth] Facebook sign-in error:", error)
        throw error
      }

      console.log("[Auth] Facebook sign-in initiated successfully")
    } catch (error: any) {
      console.error("[Auth] Exception during Facebook sign-in:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred during Facebook sign in.",
        variant: "destructive",
      })
    }
  }

  const signInWithApple = async () => {
    try {
      console.log("[Auth] Initiating Apple sign-in")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
          flowType: 'pkce'
        },
      })

      if (error) {
        console.error("[Auth] Apple sign-in error:", error)
        throw error
      }

      console.log("[Auth] Apple sign-in initiated successfully")
    } catch (error: any) {
      console.error("[Auth] Exception during Apple sign-in:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred during Apple sign in.",
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        })
      }
      // Router redirect handled by onAuthStateChange
    } catch (error) {
      console.error("Exception during sign out:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
      })
      return { error }
    } catch (error: any) {
      console.error("Error in resetPassword:", error)
      return { error }
    }
  }

  const updateProfile = async (data: any) => {
    try {
      // Limit the size of data being updated
      const trimmedData: ProfileData = {};
      
      // Only include essential fields
      if (data.name) trimmedData.name = data.name;
      if (data.avatar_url) trimmedData.avatar_url = data.avatar_url;
      if (data.country) trimmedData.country = data.country;
      if (data.street) trimmedData.street = data.street;
      if (data.city) trimmedData.city = data.city;
      if (data.state) trimmedData.state = data.state;
      if (data.postal_code) trimmedData.postal_code = data.postal_code;
      if (data.phone) trimmedData.phone = data.phone;
      
      const { error } = await supabase.auth.updateUser({
        data: trimmedData,
      })
      
      if (!error && user) {
        // Update the user_profiles table too with just the necessary fields
        const profileData = {
          user_id: user.id,
          updated_at: new Date().toISOString(),
          ...trimmedData
        };
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'user_id' });
          
        if (profileError) {
          console.error("Error updating user profile:", profileError)
        }
      }
      
      return { error }
    } catch (error: any) {
      console.error("Error in updateProfile:", error)
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
