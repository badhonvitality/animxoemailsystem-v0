"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/admin/stats-cards"
import { RecentActivity } from "@/components/admin/recent-activity"
import { RealTimeActivity } from "@/components/admin/real-time-activity"
import { AdminService } from "@/lib/admin"
import { useSystemStats } from "@/hooks/use-realtime-data"

export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useSystemStats()
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const activityData = await AdminService.getRecentActivity()
      setRecentActivity(activityData)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your email system</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity activities={recentActivity} />
        <RealTimeActivity />
      </div>
    </div>
  )
}
