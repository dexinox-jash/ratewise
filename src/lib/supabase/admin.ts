import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Note: This client should ONLY be used in server-side code (API routes, server actions)
// Never expose the service role key to the client side

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Admin helper functions
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (error) throw error
  return data.user
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw error
}

export async function updateUserById(
  userId: string,
  attributes: {
    email?: string
    password?: string
    email_confirm?: boolean
    user_metadata?: Record<string, any>
    app_metadata?: Record<string, any>
  }
) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    attributes
  )
  if (error) throw error
  return data.user
}

export async function listUsers(params?: {
  page?: number
  perPage?: number
}) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers(params)
  if (error) throw error
  return data.users
}

// Database admin operations
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    status: string
    price_id?: string
    quantity?: number
    cancel_at_period_end?: boolean
    current_period_start?: string
    current_period_end?: string
    ended_at?: string | null
    cancel_at?: string | null
    canceled_at?: string | null
    trial_start?: string | null
    trial_end?: string | null
  }
) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      ...subscriptionData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
