"use client"

import { useState, useEffect } from "react"
import { DatabaseService } from "@/lib/database"
import type { User } from "@/types"

export function useRealtimeUser(uid: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    const unsubscribe = DatabaseService.subscribeToUser(uid, (userData) => {
      setUser(userData)
      setLoading(false)
    })

    return unsubscribe
  }, [uid])

  return { user, loading }
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = DatabaseService.subscribeToUsers((usersData) => {
      setUsers(usersData)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { users, loading }
}

export function useRealtimeActivities(userId: string) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const unsubscribe = DatabaseService.subscribeToActivities(userId, (activitiesData) => {
      setActivities(activitiesData)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  return { activities, loading }
}

export function useSystemStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEmailAccounts: 0,
    inactiveUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await DatabaseService.getSystemStats()
      setStats(statsData)
      setLoading(false)
    }

    fetchStats()

    // Update stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { stats, loading }
}
