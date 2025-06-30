"use client"

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, Download, Wifi, WifiOff } from "lucide-react"
import { supabase, type Transaction } from "@/lib/supabase"
import { useTransactionsRealtime } from "@/hooks/use-realtime"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stationFilter, setStationFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Realtime subscription for transactions with memoized callbacks
  const { isConnected } = useTransactionsRealtime(useCallback((payload: any) => {
    if (payload.eventType === "INSERT") {
      // Add new transaction to the list, but check for duplicates first
      const newTransaction = payload.new as Transaction
      console.log("Realtime INSERT transaction:", newTransaction)
      
      setTransactions(prev => {
        // Check if transaction already exists (by ID)
        const exists = prev.some(t => t.id === newTransaction.id)
        if (exists) {
          console.log("Transaction already exists, skipping duplicate:", newTransaction.id)
          return prev
        }
        console.log("Adding new transaction:", newTransaction.id)
        return [newTransaction, ...prev]
      })
    } else if (payload.eventType === "UPDATE") {
      // Update existing transaction
      const updatedTransaction = payload.new as Transaction
      console.log("Realtime UPDATE transaction:", updatedTransaction.id)
      
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      )
    } else if (payload.eventType === "DELETE") {
      // Remove deleted transaction
      const deletedTransaction = payload.old as Transaction
      console.log("Realtime DELETE transaction:", deletedTransaction.id)
      
      setTransactions(prev => prev.filter(t => t.id !== deletedTransaction.id))
    }
  }, []))

  const fetchTransactions = useCallback(async () => {
    try {
      console.log("Fetching transactions from database...")
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("timestamp", { ascending: sortOrder === "asc" })

      if (error) throw error

      console.log("Fetched transactions:", data?.length || 0, "records")
      if (data && data.length > 0) {
        console.log("Transaction IDs:", data.map(t => t.id))
      }

      setTransactions(data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setLoading(false)
    }
  }, [sortOrder])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.saree_id.includes(searchTerm) ||
      transaction.from_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to_station.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStation =
      stationFilter === "all" || transaction.from_station === stationFilter || transaction.to_station === stationFilter
    return matchesSearch && matchesStation
  })

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Header title="Transactions" />
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
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
      <Header title="Transactions" breadcrumbs={[{ label: "Operations" }, { label: "Transactions" }]} />

      {/* Realtime Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isConnected ? (
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
        {/* Main Table */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Transaction History
              </CardTitle>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Saree ID or Station..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-full sm:w-48 border-0 bg-gray-50 dark:bg-gray-900">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Dyeing">Dyeing</SelectItem>
                  <SelectItem value="FMH">FMH</SelectItem>
                  <SelectItem value="FMG">FMG</SelectItem>
                  <SelectItem value="Showroom Inward">Showroom Inward</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="w-full sm:w-auto border-0 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by Time
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600">
                    <TableHead className="font-semibold">Saree ID</TableHead>
                    <TableHead className="font-semibold">From</TableHead>
                    <TableHead className="font-semibold">To</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No transactions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                          {transaction.saree_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          >
                            {transaction.from_station}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                          >
                            {transaction.to_station}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleString()}
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
