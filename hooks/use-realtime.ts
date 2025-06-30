import { useEffect, useState, useCallback } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"
import { supabase, type Saree, type Transaction, type Station } from "@/lib/supabase"

interface UseRealtimeOptions {
  table: "sarees" | "transactions" | "stations" | "through_put"
  onUpdate?: (payload: any) => void
  onInsert?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealtime<T>({ table, onUpdate, onInsert, onDelete }: UseRealtimeOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize the callback to prevent infinite re-renders
  const handleRealtimeChange = useCallback((payload: any) => {
    console.log(`Realtime ${table} change:`, payload)
    
    try {
      switch (payload.eventType) {
        case "INSERT":
          console.log(`Realtime ${table} INSERT event received:`, payload.new)
          onInsert?.(payload)
          break
        case "UPDATE":
          console.log(`Realtime ${table} UPDATE event received:`, payload.new)
          onUpdate?.(payload)
          break
        case "DELETE":
          console.log(`Realtime ${table} DELETE event received:`, payload.old)
          onDelete?.(payload)
          break
        default:
          console.log(`Realtime ${table} unknown event type:`, payload.eventType)
      }
    } catch (err) {
      console.error(`Error handling realtime ${table} change:`, err)
      setError(`Error handling ${table} change: ${err}`)
    }
  }, [table, onUpdate, onInsert, onDelete])

  useEffect(() => {
    console.log(`Setting up realtime subscription for ${table}...`)
    
    // Check authentication first
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error(`Auth error for ${table} realtime:`, authError)
        setError(`Authentication error: ${authError.message}`)
        return false
      }
      if (!user) {
        console.error(`No authenticated user for ${table} realtime`)
        setError('No authenticated user')
        return false
      }
      console.log(`User authenticated for ${table} realtime:`, user.email)
      return true
    }

    const setupRealtime = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) return

      try {
        // Create a new realtime channel
        const newChannel = supabase
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
            },
            handleRealtimeChange
          )
          .subscribe((status) => {
            console.log(`Realtime ${table} subscription status:`, status)
            setIsConnected(status === "SUBSCRIBED")
            
            if (status === "CHANNEL_ERROR") {
              console.error(`Realtime ${table} channel error`)
              setError(`Channel error for ${table}`)
            } else if (status === "TIMED_OUT") {
              console.error(`Realtime ${table} timed out`)
              setError(`Connection timed out for ${table}`)
            } else if (status === "CLOSED") {
              console.log(`Realtime ${table} channel closed`)
              setIsConnected(false)
            }
          })

        setChannel(newChannel)
        setError(null)
      } catch (err) {
        console.error(`Error setting up realtime for ${table}:`, err)
        setError(`Setup error for ${table}: ${err}`)
      }
    }

    setupRealtime()

    // Cleanup function
    return () => {
      console.log(`Cleaning up realtime subscription for ${table}...`)
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, handleRealtimeChange])

  return { channel, isConnected, error }
}

// Specific hooks for each table
export function useSareesRealtime(onUpdate?: (payload: any) => void) {
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])
  
  return useRealtime<Saree>({
    table: "sarees",
    onInsert: memoizedOnUpdate,
    onUpdate: memoizedOnUpdate,
    onDelete: memoizedOnUpdate,
  })
}

export function useTransactionsRealtime(onUpdate?: (payload: any) => void) {
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])
  
  return useRealtime<Transaction>({
    table: "transactions",
    onInsert: memoizedOnUpdate,
    onUpdate: memoizedOnUpdate,
    onDelete: memoizedOnUpdate,
  })
}

export function useStationsRealtime(onUpdate?: (payload: any) => void) {
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])
  
  return useRealtime<Station>({
    table: "stations",
    onInsert: memoizedOnUpdate,
    onUpdate: memoizedOnUpdate,
    onDelete: memoizedOnUpdate,
  })
}

// ThroughPut type
export interface ThroughPut {
  id: string
  count: number
  created_at: string
  updated_at: string
}

export function useThroughPutRealtime(onUpdate?: (payload: any) => void) {
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])
  return useRealtime<ThroughPut>({
    table: "through_put",
    onInsert: memoizedOnUpdate,
    onUpdate: memoizedOnUpdate,
    onDelete: memoizedOnUpdate,
  })
} 