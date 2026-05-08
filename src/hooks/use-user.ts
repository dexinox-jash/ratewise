'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import { User } from '@/lib/supabase/database.types'

interface UseUserReturn {
  user: User | null
  isLoading: boolean
  error: Error | null
  updateUser: (data: Partial<User>) => Promise<{ error: Error | null }>
  updateAvatar: (file: File) => Promise<{ error: Error | null; url?: string }>
  refreshUser: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    if (!authUser) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        throw userError
      }

      setUser(data)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user'))
    } finally {
      setIsLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Listen for realtime user updates
  useEffect(() => {
    if (!authUser) return

    const userChannel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setUser(payload.new as User)
          }
        }
      )
      .subscribe()

    return () => {
      userChannel.unsubscribe()
    }
  }, [authUser])

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!authUser) {
      return { error: new Error('User not authenticated') }
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)

      if (updateError) {
        throw updateError
      }

      // Refresh user data
      await fetchUser()

      return { error: null }
    } catch (err) {
      console.error('Error updating user:', err)
      return { error: err instanceof Error ? err : new Error('Failed to update user') }
    }
  }, [authUser, fetchUser])

  const updateAvatar = useCallback(async (file: File) => {
    if (!authUser) {
      return { error: new Error('User not authenticated') }
    }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { error: new Error('File must be an image') }
      }

      if (file.size > 5 * 1024 * 1024) {
        return { error: new Error('File size must be less than 5MB') }
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user record
      const { error: updateError } = await updateUser({ avatar_url: publicUrl })

      if (updateError) {
        throw updateError
      }

      return { error: null, url: publicUrl }
    } catch (err) {
      console.error('Error updating avatar:', err)
      return { error: err instanceof Error ? err : new Error('Failed to update avatar') }
    }
  }, [authUser, updateUser])

  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  return {
    user,
    isLoading,
    error,
    updateUser,
    updateAvatar,
    refreshUser,
  }
}

// Hook to get user activity/stats
export function useUserStats() {
  const { user: authUser } = useAuth()
  const [stats, setStats] = useState<{
    totalCalculations: number
    calculationsThisMonth: number
    lastActive: Date | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      if (!authUser) {
        setStats(null)
        setIsLoading(false)
        return
      }

      try {
        // Get total calculations
        const { count: totalCalculations, error: countError } = await supabase
          .from('calculations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)

        if (countError) throw countError

        // Get calculations this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: calculationsThisMonth, error: monthError } = await supabase
          .from('calculations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
          .gte('created_at', startOfMonth.toISOString())

        if (monthError) throw monthError

        // Get last active
        const { data: lastCalculation, error: lastError } = await supabase
          .from('calculations')
          .select('created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (lastError && lastError.code !== 'PGRST116') throw lastError

        setStats({
          totalCalculations: totalCalculations || 0,
          calculationsThisMonth: calculationsThisMonth || 0,
          lastActive: lastCalculation?.created_at 
            ? new Date(lastCalculation.created_at) 
            : null,
        })
      } catch (err) {
        console.error('Error fetching user stats:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch user stats'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [authUser])

  return { stats, isLoading, error }
}
