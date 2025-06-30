"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/layout/header"
import { Eye, Palette, Package, Store, Warehouse, Wifi, WifiOff } from "lucide-react"
import { supabase, type Station } from "@/lib/supabase"
import { useSareesRealtime, useStationsRealtime, useTransactionsRealtime, useThroughPutRealtime } from "@/hooks/use-realtime"

interface DashboardData {
  stationData: Station[]
  totalSarees: number
  dailyThroughput: {
    completed: number
    target: number
  }
}

// Frontend utility functions to handle UI data
const getStationConfig = (stationName: string) => {
  const configs = {
    Inspection: {
      icon: Eye,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    Dyeing: {
      icon: Palette,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
    },
    FMH: {
      icon: Warehouse,
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
    },
    FWH: {
      icon: Warehouse,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
    },
    FMG: {
      icon: Package,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
    },
    "Showroom Inward": {
      icon: Store,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
    },
  }
  return (
    configs[stationName as keyof typeof configs] || {
      icon: Package,
      color: "bg-gray-500",
      gradient: "from-gray-500 to-gray-600",
    }
  )
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [previousFMGCount, setPreviousFMGCount] = useState(0)

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch stations data with their count field from database
      const { data: stationsData, error: stationsError } = await supabase.from("stations").select("*").order("name")

      if (stationsError) throw stationsError

      console.log("Stations data from database:", stationsData?.map(s => ({ name: s.name, count: s.count })))

      // Get total sarees count
      const { count: totalSarees, error: countError } = await supabase
        .from("sarees")
        .select("*", { count: "exact", head: true })

      if (countError) throw countError

      // Start production overview from 900
      const baseProductionNumber = 900
      const adjustedTotalSarees = baseProductionNumber + (totalSarees || 0)

      // Fetch through_put count
      const { data: throughPutData, error: throughPutError } = await supabase
        .from("through_put")
        .select("count")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (throughPutError) throw throughPutError
      const throughPutCount = (throughPutData?.count || 0) + 300

      // Calculate daily target (you can adjust this logic based on your business rules)
      // For now, let's set it to a reasonable target based on total sarees
      const dailyTarget = Math.max(120, Math.ceil((totalSarees || 0) * 0.1)) // 10% of total sarees or minimum 120

      console.log("Daily target:", dailyTarget, "Total sarees:", totalSarees)

      const dashboardData: DashboardData = {
        stationData: (stationsData || []).sort((a, b) => {
          // Custom ordering: Inspection, Dyeing, FMH, FWH, FMG, Showroom Inward
          const order = ["Inspection", "Dyeing", "FMH", "FWH", "FMG", "Showroom Inward"];
          return order.indexOf(a.name) - order.indexOf(b.name);
        }),
        totalSarees: adjustedTotalSarees,
        dailyThroughput: {
          completed: throughPutCount,
          target: dailyTarget,
        },
      }

      setDashboardData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }, [])

  // Realtime subscriptions with memoized callbacks
  const { isConnected: sareesConnected } = useSareesRealtime(useCallback(() => {
    // Refetch dashboard data when sarees change
    fetchDashboardData()
  }, [fetchDashboardData]))

  const { isConnected: stationsConnected } = useStationsRealtime(useCallback(() => {
    // Refetch dashboard data when stations change
    fetchDashboardData()
  }, [fetchDashboardData]))

  const { isConnected: transactionsConnected } = useTransactionsRealtime(useCallback(() => {
    // Refetch dashboard data when transactions change (for daily throughput)
    fetchDashboardData()
  }, [fetchDashboardData]))

  // Realtime subscription for through_put
  useThroughPutRealtime(useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData]))

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Dashboard" />
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.round(
    (dashboardData.dailyThroughput.completed / dashboardData.dailyThroughput.target) * 100,
  )

  // Calculate chart data for station distribution (WIP) - now including FMH
  const chartData = dashboardData.stationData
    .filter(station => ["Inspection", "Dyeing", "FMH", "FWH"].includes(station.name))
    .sort((a, b) => {
      const order = ["Inspection", "Dyeing", "FMH", "FWH"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    })
    .map((station) => {
      return {
        name: station.name,
        count: station.count,
        color: getStationConfig(station.name).color,
      };
    });

  console.log("WIP Chart Data:", chartData);
  console.log("Total WIP (Inspection + Dyeing + FMH + FWH):", chartData.reduce((sum, item) => sum + item.count, 0));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Header title="Dashboard" breadcrumbs={[{ label: "Overview" }, { label: "Dashboard" }]} />

      {/* Realtime Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {sareesConnected && stationsConnected && transactionsConnected ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="h-4 w-4" />
            <span>Live updates enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <WifiOff className="h-4 w-4" />
            <span>Connecting to live updates...</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6">
        {/* Hero Stats - 50-50 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Production Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {dashboardData.totalSarees.toLocaleString()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Total Sarees in Production</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Daily Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
                    {dashboardData.dailyThroughput.completed}
                  </div>
                  <p className="text-green-700 dark:text-green-300">Sarees completed today</p>
                </div>
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
          {dashboardData.stationData.map((station, index) => {
            const config = getStationConfig(station.name)
            const Icon = config.icon

            return (
              <Card
                key={station.name}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{station.name}</CardTitle>
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {station.count.toLocaleString()} <span className="text-lg">sarees</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="mt-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Active
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Distribution Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Department-wise WIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      background: `linear-gradient(135deg, ${item.color.replace("bg-", "").replace("-500", "")}-400, ${item.color.replace("bg-", "").replace("-500", "")}-600)`,
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
