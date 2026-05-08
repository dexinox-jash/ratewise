// Client-side Supabase client
export { createClient as createBrowserClient, supabase } from './client'

// Server-side Supabase client
export { createClient as createServerClient, getSession, getUserDetails } from './server'

// Admin Supabase client (server-side only)
export { 
  supabaseAdmin,
  getUserById,
  deleteUser,
  updateUserById,
  listUsers,
  getUserSubscription,
  updateUserSubscription,
} from './admin'

// Database types
export type {
  Database,
  Tables,
  Enums,
  User,
  Subscription,
  Price,
  Product,
  Calculation,
} from './database.types'
