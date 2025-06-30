"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Users, 
  Globe, 
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [realtimeUpdates, setRealtimeUpdates] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Header 
        title="Settings" 
        breadcrumbs={[{ label: "System" }, { label: "Settings" }]} 
      />

      <div className="flex-1 space-y-6">
        {/* Settings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">General</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Application preferences</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Notifications</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">Alert preferences</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Security</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">Privacy & security</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Realtime Updates</Label>
                    <p className="text-sm text-muted-foreground">Enable live data updates</p>
                  </div>
                  <Switch checked={realtimeUpdates} onCheckedChange={setRealtimeUpdates} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh data</p>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                
                {autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Notification Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="new-saree" defaultChecked className="rounded" />
                      <Label htmlFor="new-saree" className="text-sm">New saree added</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="station-change" defaultChecked className="rounded" />
                      <Label htmlFor="station-change" className="text-sm">Station changes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="completion" defaultChecked className="rounded" />
                      <Label htmlFor="completion" className="text-sm">Saree completion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="errors" className="rounded" />
                      <Label htmlFor="errors" className="text-sm">System errors</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-semibold">Supabase</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Framework</p>
                <p className="font-semibold">Next.js 14</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
} 