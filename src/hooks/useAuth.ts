import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface AuthUser extends User {
  role?: 'scout' | 'fan' | 'athlete'
  full_name?: string
  reputation_score?: number
}

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name, reputation_score')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.warn('Failed to fetch user profile:', error)
      return authUser
    }

    return {
      ...authUser,
      role: profile.role,
      full_name: profile.full_name,
      reputation_score: profile.reputation_score
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        setUser(null)
        return
      }

      const userWithProfile = await fetchUserProfile(authUser)
      setUser(userWithProfile)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          return
        }

        if (session?.user) {
          const userWithProfile = await fetchUserProfile(session.user)
          setUser(userWithProfile)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userWithProfile = await fetchUserProfile(session.user)
          setUser(userWithProfile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser
  }
}