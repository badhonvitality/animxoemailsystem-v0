"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtimeActivities } from "@/hooks/use-realtime-data"
import { formatDistanceToNow } from "date-fns"
import { Activity, Mail, User, Trash2 } from "lucide-react"

interface RealTimeActivityProps {
  userId?: string
}

export function RealTimeActivity({ userId }: RealTimeActivityProps) {
  const { activities, loading } = useRealtimeActivities(userId || "")

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "email_created":
        return <Mail className="h-4 w-4 text-green-500" />
      case "email_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "user_login":
        return <User className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityDescription = (activity: any) => {
    switch (activity.action) {
      case "email_created":
        return `Created email account: ${activity.data.email}`
      case "email_deleted":
        return `Deleted email account: ${activity.data.email}`
      case "user_login":
        return "User logged in"
      default:
        return activity.action
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.action.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
