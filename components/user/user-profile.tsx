"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { DatabaseService } from "@/lib/database"
import { User, Mail, Calendar, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)
    const result = await DatabaseService.updateUser(user.uid, {
      displayName: displayName || undefined,
    })

    if (result.success) {
      setIsEditing(false)
    }

    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{user.displayName || user.email}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant={user.isAdmin ? "default" : "secondary"}>
                  {user.isAdmin ? "Administrator" : "User"}
                </Badge>
                {user.isAdmin && (
                  <Badge variant="outline" className="text-blue-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin Access
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                  <Button size="sm" onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input value={user.displayName || "Not set"} disabled />
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatDistanceToNow(user.createdAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>
                Last login {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Overview of your account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">{user.emailAccounts?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Email Accounts</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {user.emailAccounts?.reduce((total, account) => total + account.usedQuota, 0) || 0} MB
              </div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {user.emailAccounts?.reduce((total, account) => total + account.quota, 0) || 0} MB
              </div>
              <p className="text-sm text-muted-foreground">Total Quota</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
