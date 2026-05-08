'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import { Subscription, Price, Product } from '@/lib/supabase/database.types'

interface SubscriptionWithPrice extends Subscription {
  prices: Price & {
    products: Product
  } | null
}

interface UseSubscriptionReturn {
  subscription: SubscriptionWithPrice | null
  isLoading: boolean
  error: Error | null
  isSubscribed: boolean
  isTrialing: boolean
  isCanceled: boolean
  isPastDue: boolean
  currentPeriodEnd: Date | null
  refreshSubscription: () => Promise<void>
  redirectToCheckout: (priceId: string) => Promise<void>
  redirectToCustomerPortal: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionWithPrice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          prices (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['trialing', 'active', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError
      }

      setSubscription(data as SubscriptionWithPrice || null)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Listen for realtime subscription updates
  useEffect(() => {
    if (!user) return

    const subscriptionChannel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      subscriptionChannel.unsubscribe()
    }
  }, [user, fetchSubscription])

  const refreshSubscription = useCallback(async () => {
    await fetchSubscription()
  }, [fetchSubscription])

  const redirectToCheckout = useCallback(async (priceId: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to checkout')
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Error redirecting to checkout:', err)
      throw err
    }
  }, [isAuthenticated])

  const redirectToCustomerPortal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to access customer portal')
    }

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Error redirecting to customer portal:', err)
      throw err
    }
  }, [isAuthenticated])

  // Derived state
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isTrialing = subscription?.status === 'trialing'
  const isCanceled = subscription?.cancel_at_period_end === true
  const isPastDue = subscription?.status === 'past_due'
  const currentPeriodEnd = subscription?.current_period_end 
    ? new Date(subscription.current_period_end) 
    : null

  return {
    subscription,
    isLoading,
    error,
    isSubscribed,
    isTrialing,
    isCanceled,
    isPastDue,
    currentPeriodEnd,
    refreshSubscription,
    redirectToCheckout,
    redirectToCustomerPortal,
  }
}

// Hook to fetch all available prices
export function usePrices() {
  const [prices, setPrices] = useState<(Price & { products: Product })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error: pricesError } = await supabase
          .from('prices')
          .select(`
            *,
            products (*)
          `)
          .eq('active', true)
          .order('unit_amount', { ascending: true })

        if (pricesError) {
          throw pricesError
        }

        setPrices(data as (Price & { products: Product })[] || [])
      } catch (err) {
        console.error('Error fetching prices:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch prices'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [])

  return { prices, isLoading, error }
}
