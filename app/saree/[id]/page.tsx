"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, Circle, Clock, Eye, Palette, Package, Store, Warehouse } from "lucide-react"
import { supabase, type Saree, calculateStationDuration } from "@/lib/supabase"

interface SareeStage {
  name: string
  status: "completed" | "current" | "pending"
  timestamp?: string | null
}

interface SareeProgress extends Saree {
  stages: SareeStage[]
}

// Frontend utility function to get stage icon
const getStageIcon = (stageName: string) => {
  const icons = {
    Inspection: Eye,
    Dyeing: Palette,
    FWH: Warehouse,
    FMG: Package,
    "Showroom Inward": Store,
  }
  return icons[stageName as keyof typeof icons] || Package
}

const STAGES = ["Inspection", "Dyeing", "FWH", "FMG", "Showroom Inward"]

export default function SareeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sareeData, setSareeData] = useState<SareeProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stationDuration, setStationDuration] = useState("")

  useEffect(() => {
    const fetchSareeData = async () => {
      try {
        const sareeId = params.id as string

        // Fetch saree details
        const { data: sareeDetails, error: sareeError } = await supabase
          .from("sarees")
          .select("*")
          .eq("saree_id", sareeId)
          .single()

        if (sareeError) throw sareeError

        // Fetch transactions for this saree to build timeline
        const { data: transactions, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("saree_id", sareeId)
          .order("timestamp", { ascending: true })

        if (transactionsError) throw transactionsError

        // Calculate station duration
        const latestTransaction = transactions?.find((t) => t.to_station === sareeDetails.current_station)
        const duration = latestTransaction
          ? calculateStationDuration(latestTransaction.timestamp)
          : calculateStationDuration(sareeDetails.created_at)
        setStationDuration(duration)

        // Build stages based on transactions
        const stages: SareeStage[] = STAGES.map((stageName) => {
          // Find transaction that brought saree TO this stage
          const transactionToStage = transactions?.find((t) => t.to_station === stageName)

          if (transactionToStage) {
            return {
              name: stageName,
              status: stageName === sareeDetails.current_station ? "current" : "completed",
              timestamp: transactionToStage.timestamp,
            }
          } else if (stageName === sareeDetails.current_station) {
            return {
              name: stageName,
              status: "current",
              timestamp: sareeDetails.created_at,
            }
          } else {
            // Check if this stage comes before current station
            const currentStageIndex = STAGES.indexOf(sareeDetails.current_station)
            const thisStageIndex = STAGES.indexOf(stageName)

            return {
              name: stageName,
              status: thisStageIndex < currentStageIndex ? "completed" : "pending",
              timestamp: thisStageIndex < currentStageIndex ? sareeDetails.created_at : null,
            }
          }
        })

        const sareeWithStages: SareeProgress = {
          ...sareeDetails,
          stages,
        }

        setSareeData(sareeWithStages)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching saree data:", error)
        setError("Error fetching saree data. Please try again.")
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSareeData()
    }
  }, [params.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">In Progress</Badge>
      case "Completed":
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">Completed</Badge>
      case "Inwarded":
        return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">Inwarded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "current":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Saree Details" />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !sareeData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Saree Details" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error || "Saree not found"}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Header
        title={`Saree ${sareeData.saree_id}`}
        breadcrumbs={[
          { label: "Operations" },
          { label: "Saree Tracker", href: "/tracker" },
          { label: sareeData.saree_id },
        ]}
      />

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Saree List
          </Button>
          {getStatusBadge(sareeData.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saree Details */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Saree Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <p className="text-sm text-muted-foreground font-medium">Saree ID</p>
                  <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{sareeData.saree_id}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <p className="text-sm text-muted-foreground font-medium">Article Number</p>
                  <p className="font-mono font-semibold">{sareeData.article_number}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <p className="text-sm text-muted-foreground font-medium">Length</p>
                  <p className="font-semibold">{sareeData.length}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <p className="text-sm text-muted-foreground font-medium">Weaver Name</p>
                  <p className="font-semibold">{sareeData.weaver_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Progress */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">Status & Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-green-900 dark:text-green-100">{sareeData.progress}%</div>
                <p className="text-green-700 dark:text-green-300 mb-4 font-medium">Overall Progress</p>
                <Progress value={sareeData.progress} className="h-4 bg-green-200 dark:bg-green-800" />
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Current Status</p>
                  <p className="font-bold text-lg text-green-900 dark:text-green-100">{sareeData.status}</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Current Station</p>
                  <p className="font-bold text-lg text-green-900 dark:text-green-100">{sareeData.current_station}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Duration: {stationDuration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manufacturing Timeline */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Manufacturing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {sareeData.stages.map((stage, index) => {
                const StageIcon = getStageIcon(stage.name)
                const isLast = index === sareeData.stages.length - 1
                return (
                  <div key={stage.name} className="relative flex items-start mb-6 last:mb-0">
                    {/* Timeline connector - only show if not last item */}
                    {!isLast && <div className="absolute left-5 top-10 w-px h-16 bg-gray-200 dark:bg-gray-700 z-0" />}

                    {/* Stage status circle */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 ${
                        stage.status === "completed"
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : stage.status === "current"
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                      }`}
                    >
                      {getStageStatusIcon(stage.status)}
                    </div>

                    {/* Stage content */}
                    <div className="flex-1 ml-4 min-w-0">
                      <div
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          stage.status === "completed"
                            ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800"
                            : stage.status === "current"
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800"
                              : "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                stage.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : stage.status === "current"
                                    ? "bg-blue-100 dark:bg-blue-900"
                                    : "bg-gray-100 dark:bg-gray-800"
                              }`}
                            >
                              <StageIcon
                                className={`h-5 w-5 ${
                                  stage.status === "completed"
                                    ? "text-green-600 dark:text-green-400"
                                    : stage.status === "current"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-600 dark:text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{stage.name}</h3>
                              <div className="mt-1">
                                {stage.status === "completed" && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-xs">
                                    Completed
                                  </Badge>
                                )}
                                {stage.status === "current" && (
                                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs">
                                    In Progress
                                  </Badge>
                                )}
                                {stage.status === "pending" && (
                                  <Badge variant="secondary" className="text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {stage.timestamp && (
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(stage.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(stage.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
