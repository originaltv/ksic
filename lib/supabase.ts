import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auto-signin for demo purposes
export const initializeDemoAuth = async () => {
  try {
    // Try to sign in with demo credentials
    const { error } = await supabase.auth.signInWithPassword({
      email: 'varun_tv@outlook.com',
      password: 'tv7411786785'
    })
    
    if (error) {
      console.log('Demo user not found, attempting to create...')
      // Try to create the demo user
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'varun_tv@outlook.com',
        password: 'tv7411786785'
      })
      
      if (signUpError) {
        console.error('Failed to create demo user:', signUpError)
      } else {
        console.log('Demo user created successfully')
      }
    } else {
      console.log('Demo user signed in successfully')
    }
  } catch (error) {
    console.error('Auth initialization error:', error)
  }
}

// Types for our database tables
export interface Saree {
  id: string
  saree_id: string
  article_number: string
  length: string
  weaver_name: string
  color: string
  design: string
  current_station: string
  status: "In Progress" | "Completed" | "Inwarded"
  progress: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  saree_id: string
  from_station: string
  to_station: string
  timestamp: string
  created_at: string
}

export interface Station {
  id: string
  name: string
  count: number
}

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Helper function to calculate station duration
export function calculateStationDuration(lastTransactionTime: string): string {
  const now = new Date()
  const lastTime = new Date(lastTransactionTime)
  const diffMs = now.getTime() - lastTime.getTime()
  const diffInMinutes = Math.floor(diffMs / (1000 * 60))
  const diffInHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""}`
  }
}
