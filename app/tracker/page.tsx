"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Palette, Package, Store, Warehouse, Wifi, WifiOff } from "lucide-react"
import { supabase, type Saree, calculateStationDuration } from "@/lib/supabase"
import { useSareesRealtime } from "@/hooks/use-realtime"

interface SareeWithDuration extends Saree {
  stationDuration: string
}

export default function TrackerPage() {
  const [sarees, setSarees] = useState<SareeWithDuration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Realtime subscription for sarees with memoized callbacks
  const { isConnected, error } = useSareesRealtime(useCallback(async (payload: any) => {
    if (payload.eventType === "INSERT") {
      // Add new saree to the list
      const newSaree = payload.new as Saree
      const stationDuration = calculateStationDuration(newSaree.created_at)
      const sareeWithDuration: SareeWithDuration = {
        ...newSaree,
        stationDuration,
      }
      setSarees(prev => [sareeWithDuration, ...prev])
    } else if (payload.eventType === "UPDATE") {
      // Update existing saree
      const updatedSaree = payload.new as Saree
      const { data: latestTransaction } = await supabase
        .from("transactions")
        .select("timestamp")
        .eq("saree_id", updatedSaree.saree_id)
        .eq("to_station", updatedSaree.current_station)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle()

      const stationDuration = latestTransaction
        ? calculateStationDuration(latestTransaction.timestamp)
        : calculateStationDuration(updatedSaree.created_at)

      const sareeWithDuration: SareeWithDuration = {
        ...updatedSaree,
        stationDuration,
      }

      setSarees(prev => 
        prev.map(s => s.id === updatedSaree.id ? sareeWithDuration : s)
      )
    } else if (payload.eventType === "DELETE") {
      // Remove deleted saree
      setSarees(prev => prev.filter(s => s.id !== payload.old.id))
    }
  }, []))

  const fetchSarees = useCallback(async () => {
    try {
      const { data: sareesData, error: sareesError } = await supabase
        .from("sarees")
        .select("*")
        .order("created_at", { ascending: false })

      if (sareesError) throw sareesError

      // For each saree, get the latest transaction to calculate station duration
      const sareesWithDuration = await Promise.all(
        (sareesData || []).map(async (saree) => {
          const { data: latestTransaction } = await supabase
            .from("transactions")
            .select("timestamp")
            .eq("saree_id", saree.saree_id)
            .eq("to_station", saree.current_station)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle()

          const stationDuration = latestTransaction
            ? calculateStationDuration(latestTransaction.timestamp)
            : calculateStationDuration(saree.created_at)

          return {
            ...saree,
            stationDuration,
          }
        }),
      )

      setSarees(sareesWithDuration)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sarees:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSarees()
  }, [fetchSarees])

  const filteredSarees = sarees.filter((saree) => {
    const matchesSearch =
      saree.saree_id.includes(searchTerm) ||
      saree.article_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saree.weaver_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStationIcon = (station: string) => {
    switch (station) {
      case "Inspection":
        return <Eye className="h-4 w-4" />
      case "Dyeing":
        return <Palette className="h-4 w-4" />
      case "FWH":
        return <Warehouse className="h-4 w-4" />
      case "FMG":
        return <Package className="h-4 w-4" />
      case "Showroom Inward":
        return <Store className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleRowClick = (sareeId: string) => {
    router.push(`/saree/${sareeId}`)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Saree Tracker" />
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Header title="Saree Tracker" breadcrumbs={[{ label: "Operations" }, { label: "Saree Tracker" }]} />

      {/* Realtime Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="h-4 w-4" />
            <span>Live updates enabled</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span>Connection error: {error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <WifiOff className="h-4 w-4" />
            <span>Connecting to live updates...</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6">
        {/* Main Table */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                All Sarees
              </CardTitle>
              <p className="text-sm text-muted-foreground">Click on any row to view detailed progress</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Saree ID, Article Number, or Weaver Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600">
                    <TableHead className="font-semibold">Saree ID</TableHead>
                    <TableHead className="font-semibold">Article Number</TableHead>
                    <TableHead className="font-semibold">Length</TableHead>
                    <TableHead className="font-semibold">Weaver Name</TableHead>
                    <TableHead className="font-semibold">Current Station</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSarees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No sarees found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSarees.map((saree, index) => (
                      <TableRow
                        key={saree.id}
                        className="hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => handleRowClick(saree.saree_id)}
                      >
                        <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                          {saree.saree_id}
                        </TableCell>
                        <TableCell className="font-mono font-medium">{saree.article_number}</TableCell>
                        <TableCell className="font-medium">{saree.length}</TableCell>
                        <TableCell className="font-medium">{saree.weaver_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {getStationIcon(saree.current_station)}
                              <span className="text-sm font-medium">{saree.current_station}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{saree.stationDuration}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {saree.status === "Completed" ? (
                            <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">Completed</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">In Progress</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const stationOrder = ["Inspection", "Dyeing", "FMH", "FWH", "FMG", "Showroom Inward"];
                            const currentStep = stationOrder.indexOf(saree.current_station);
                            const totalSteps = stationOrder.length;
                            return (
                              <div className="flex items-center gap-1">
                                {stationOrder.map((station, idx) => (
                                  <div
                                    key={station}
                                    className={`h-2 w-6 rounded-full ${
                                      idx < currentStep
                                        ? "bg-green-500"
                                        : idx === currentStep
                                        ? "bg-blue-500"
                                        : "bg-gray-300 dark:bg-gray-700"
                                    }`}
                                    title={station}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
