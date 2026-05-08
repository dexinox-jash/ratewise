'use client'

import { useCallback, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { User as UserType } from '@/lib/supabase/database.types'

interface UseAuthReturn {
  user: User | null
  userDetails: UserType | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  updateEmail: (email: string) => Promise<{ error: AuthError | null }>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [userDetails, setUserDetails] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // Fetch user details from the database
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user details:', error)
        return
      }
      
      setUserDetails(data)
    } catch (err) {
      console.error('Error in fetchUserDetails:', err)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error)
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchUserDetails(session.user.id)
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserDetails(session.user.id)
        } else {
          setUserDetails(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserDetails])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }, [])

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string }
  ) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      setError(error)
    }
    
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setError(error)
    } else {
      setUser(null)
      setUserDetails(null)
      setSession(null)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    setError(null)
    const { error } = await supabase.auth.updateUser({
      password,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }, [])

  const updateEmail = useCallback(async (email: string) => {
    setError(null)
    const { error } = await supabase.auth.updateUser({
      email,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }, [])

  const refreshSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      setError(error)
      return
    }
    
    setSession(session)
    setUser(session?.user ?? null)
    
    if (session?.user) {
      await fetchUserDetails(session.user.id)
    }
  }, [fetchUserDetails])

  return {
    user,
    userDetails,
    session,
    isLoading,
    isAuthenticated: !!user,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshSession,
  }
}
