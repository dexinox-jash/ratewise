'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import { Calculation } from '@/lib/supabase/database.types'

interface CalculationInput {
  type: string
  name: string
  inputs: Record<string, any>
  results: Record<string, any>
}

interface UseCalculationsReturn {
  calculations: Calculation[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  totalCount: number
  fetchCalculations: (page?: number, limit?: number) => Promise<void>
  fetchMore: () => Promise<void>
  saveCalculation: (calculation: CalculationInput) => Promise<{ error: Error | null; data?: Calculation }>
  updateCalculation: (id: string, updates: Partial<CalculationInput>) => Promise<{ error: Error | null }>
  deleteCalculation: (id: string) => Promise<{ error: Error | null }>
  getCalculation: (id: string) => Promise<{ data: Calculation | null; error: Error | null }>
  refreshCalculations: () => Promise<void>
}

const DEFAULT_LIMIT = 20

export function useCalculations(): UseCalculationsReturn {
  const { user, isAuthenticated } = useAuth()
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchCalculations = useCallback(async (
    pageNum: number = 1,
    limit: number = DEFAULT_LIMIT
  ) => {
    if (!user) {
      setCalculations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) throw countError
      setTotalCount(count || 0)

      // Get calculations
      const { data, error: calcError } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * limit, pageNum * limit - 1)

      if (calcError) throw calcError

      if (pageNum === 1) {
        setCalculations(data || [])
      } else {
        setCalculations(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === limit)
      setPage(pageNum)
    } catch (err) {
      console.error('Error fetching calculations:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch calculations'))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const fetchMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchCalculations(page + 1)
  }, [fetchCalculations, hasMore, isLoading, page])

  useEffect(() => {
    fetchCalculations(1)
  }, [fetchCalculations])

  // Listen for realtime calculation updates
  useEffect(() => {
    if (!user) return

    const calculationsChannel = supabase
      .channel('calculations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calculations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCalculations(prev => [payload.new as Calculation, ...prev])
            setTotalCount(prev => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            setCalculations(prev =>
              prev.map(calc =>
                calc.id === payload.new.id ? (payload.new as Calculation) : calc
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCalculations(prev =>
              prev.filter(calc => calc.id !== payload.old.id)
            )
            setTotalCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      calculationsChannel.unsubscribe()
    }
  }, [user])

  const saveCalculation = useCallback(async (calculation: CalculationInput) => {
    if (!user) {
      return { error: new Error('User not authenticated') }
    }

    try {
      const { data, error: saveError } = await supabase
        .from('calculations')
        .insert({
          user_id: user.id,
          type: calculation.type,
          name: calculation.name,
          inputs: calculation.inputs,
          results: calculation.results,
        })
        .select()
        .single()

      if (saveError) throw saveError

      return { error: null, data }
    } catch (err) {
      console.error('Error saving calculation:', err)
      return { error: err instanceof Error ? err : new Error('Failed to save calculation') }
    }
  }, [user])

  const updateCalculation = useCallback(async (
    id: string,
    updates: Partial<CalculationInput>
  ) => {
    if (!user) {
      return { error: new Error('User not authenticated') }
    }

    try {
      const { error: updateError } = await supabase
        .from('calculations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      return { error: null }
    } catch (err) {
      console.error('Error updating calculation:', err)
      return { error: err instanceof Error ? err : new Error('Failed to update calculation') }
    }
  }, [user])

  const deleteCalculation = useCallback(async (id: string) => {
    if (!user) {
      return { error: new Error('User not authenticated') }
    }

    try {
      const { error: deleteError } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      return { error: null }
    } catch (err) {
      console.error('Error deleting calculation:', err)
      return { error: err instanceof Error ? err : new Error('Failed to delete calculation') }
    }
  }, [user])

  const getCalculation = useCallback(async (id: string) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    try {
      const { data, error: getError } = await supabase
        .from('calculations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (getError) throw getError

      return { data, error: null }
    } catch (err) {
      console.error('Error getting calculation:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Failed to get calculation') 
      }
    }
  }, [user])

  const refreshCalculations = useCallback(async () => {
    await fetchCalculations(1)
  }, [fetchCalculations])

  return {
    calculations,
    isLoading,
    error,
    hasMore,
    totalCount,
    fetchCalculations,
    fetchMore,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    getCalculation,
    refreshCalculations,
  }
}

// Hook for a single calculation
export function useCalculation(id: string | null) {
  const { user } = useAuth()
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [isLoading, setIsLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCalculation() {
      if (!id || !user) {
        setCalculation(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: calcError } = await supabase
          .from('calculations')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (calcError) throw calcError

        setCalculation(data)
      } catch (err) {
        console.error('Error fetching calculation:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch calculation'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalculation()
  }, [id, user])

  return { calculation, isLoading, error }
}

// Hook for calculation history by type
export function useCalculationsByType(type: string) {
  const { user } = useAuth()
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCalculationsByType() {
      if (!user) {
        setCalculations([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: calcError } = await supabase
          .from('calculations')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', type)
          .order('created_at', { ascending: false })
          .limit(10)

        if (calcError) throw calcError

        setCalculations(data || [])
      } catch (err) {
        console.error('Error fetching calculations by type:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch calculations'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalculationsByType()
  }, [type, user])

  return { calculations, isLoading, error }
}
