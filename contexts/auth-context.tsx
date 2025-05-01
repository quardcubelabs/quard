"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { User, Session, AuthError } from "@supabase/supabase-js"

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

  useEffect(() => {
    const setData = async () => {
      try {
        // Get the initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          return
        }
        
        if (session) {
          console.log("Initial session found:", session.user.id)
          
          try {
            // Store sanitized user and session to avoid memory issues
            const safeSession = createSafeSession(session);
            if (safeSession) {
              setSession(safeSession);
              setUser(safeSession.user as User);
            }
          } catch (sessionError) {
            console.error("Error processing session:", sessionError);
          }
          
          // Also check if user profile exists, if not create it
          if (session.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('id, user_id, email, name')  // Select only necessary fields
                .eq('user_id', session.user.id)
                .single();
                
              if (profileError && profileError.code !== 'PGRST116') {
                console.error("Error checking user profile:", profileError)
              }
              
              // If no profile exists, create one
              if (!profile) {
                try {
                  const userData = {
                    user_id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  
                  if (session.user.user_metadata?.avatar_url) {
                    userData['avatar_url'] = session.user.user_metadata.avatar_url;
                  }
                  
                  const { error: insertError } = await supabase
                    .from('user_profiles')
                    .upsert(userData);
                    
                  if (insertError) {
                    console.error("Error creating user profile:", insertError)
                  }
                } catch (error) {
                  console.error("Error in profile creation:", error)
                }
              }
            } catch (profileCheckError) {
              console.error("Error checking for user profile:", profileCheckError);
            }
          }
        } else {
          console.log("No initial session found")
        }
      } catch (error) {
        console.error("Error in auth initialization:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setData()

    // Set up auth state change listener
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event)
        
        try {
          if (session) {
            console.log("New session established for user:", session.user.id)
            
            // Store sanitized user and session data
            const safeSession = createSafeSession(session);
            if (safeSession) {
              setSession(safeSession);
              setUser(safeSession.user as User);
            }
            
            // After successful sign-in, redirect to home page
            if (event === 'SIGNED_IN') {
              router.push('/')
            }
          } else {
            console.log("Session cleared")
            setSession(null)
            setUser(null)
            
            // After sign out, redirect to login page
            if (event === 'SIGNED_OUT') {
              router.push('/auth/login')
            }
          }
        } catch (stateChangeError) {
          console.error("Error handling auth state change:", stateChangeError);
        } finally {
          setIsLoading(false)
        }
      })

      return () => {
        try {
          subscription.unsubscribe()
        } catch (unsubError) {
          console.error("Error unsubscribing from auth state changes:", unsubError);
        }
      }
    } catch (subscriptionError) {
      console.error("Error setting up auth state change listener:", subscriptionError);
      setIsLoading(false);
      return () => {}; // Empty cleanup if setup failed
    }
  }, [supabase, router])

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      // If sign up successful and no verification is required, create user profile
      if (!error && data?.user) {
        try {
          const userData = {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })
      
      if (error) {
        console.error("Error initiating Google sign-in:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Exception during Google sign-in:", error)
      toast({
        title: "Error",
        description: "Failed to initiate Google sign-in",
        variant: "destructive",
      })
    }
  }

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error("Error initiating Facebook sign-in:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Exception during Facebook sign-in:", error)
      toast({
        title: "Error",
        description: "Failed to initiate Facebook sign-in",
        variant: "destructive",
      })
    }
  }

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error("Error initiating Apple sign-in:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Exception during Apple sign-in:", error)
      toast({
        title: "Error",
        description: "Failed to initiate Apple sign-in",
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
      const trimmedData = {};
      
      // Only include essential fields
      if (data.name) trimmedData['name'] = data.name;
      if (data.avatar_url) trimmedData['avatar_url'] = data.avatar_url;
      if (data.country) trimmedData['country'] = data.country;
      if (data.street) trimmedData['street'] = data.street;
      if (data.city) trimmedData['city'] = data.city;
      if (data.state) trimmedData['state'] = data.state;
      if (data.postal_code) trimmedData['postal_code'] = data.postal_code;
      if (data.phone) trimmedData['phone'] = data.phone;
      
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
