"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Mail, HardDrive, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailAccount {
  id: string
  email: string
  storage: number
  storageUsed: number
  status: "active" | "suspended"
  createdAt: string
}

export default function AdminEmailsPage() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [selectedStorage, setSelectedStorage] = useState("25")
  const [customStorage, setCustomStorage] = useState("")
  const [showCustomStorage, setShowCustomStorage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadEmailAccounts()
  }, [])

  const loadEmailAccounts = async () => {
    try {
      const response = await fetch("/api/admin/emails")
      if (response.ok) {
        const data = await response.json()
        setEmailAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Failed to load email accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load email accounts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createEmailAccount = async () => {
    if (!newEmail || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    let storageQuota = Number.parseInt(selectedStorage)
    if (selectedStorage === "custom") {
      if (!customStorage || Number.parseInt(customStorage) <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid custom storage amount",
          variant: "destructive",
        })
        return
      }
      storageQuota = Number.parseInt(customStorage)
    }

    // Ensure email ends with @animxo.com
    const emailAddress = newEmail.includes("@") ? newEmail : `${newEmail}@animxo.com`

    if (!emailAddress.endsWith("@animxo.com")) {
      toast({
        title: "Error",
        description: "Email must be for the animxo.com domain",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailAddress,
          password: newPassword,
          storage: storageQuota,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Email account ${emailAddress} created successfully with ${storageQuota}MB storage`,
        })
        setNewEmail("")
        setNewPassword("")
        setSelectedStorage("25")
        setCustomStorage("")
        setShowCustomStorage(false)
        loadEmailAccounts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create email account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create email account:", error)
      toast({
        title: "Error",
        description: "Failed to create email account",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const deleteEmailAccount = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return
    }

    try {
      const response = await fetch("/api/admin/emails", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Email account ${email} deleted successfully`,
        })
        loadEmailAccounts()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete email account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete email account:", error)
      toast({
        title: "Error",
        description: "Failed to delete email account",
        variant: "destructive",
      })
    }
  }

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb} MB`
  }

  const getStoragePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading email accounts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Account Management</h1>
          <p className="text-muted-foreground">Manage email accounts for animxo.com domain</p>
        </div>
      </div>

      {/* Create New Email Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Email Account
          </CardTitle>
          <CardDescription>
            Create a new email account for the animxo.com domain with flexible storage options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex">
                <Input
                  id="email"
                  placeholder="admin"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-r-none"
                />
                <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                  @animxo.com
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage Limit</Label>
              <Select
                value={selectedStorage}
                onValueChange={(value) => {
                  setSelectedStorage(value)
                  setShowCustomStorage(value === "custom")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 MB</SelectItem>
                  <SelectItem value="50">50 MB</SelectItem>
                  <SelectItem value="100">100 MB</SelectItem>
                  <SelectItem value="250">250 MB</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCustomStorage && (
            <div className="space-y-2">
              <Label htmlFor="customStorage">Custom Storage (MB)</Label>
              <Input
                id="customStorage"
                type="number"
                placeholder="Enter storage amount in MB"
                value={customStorage}
                onChange={(e) => setCustomStorage(e.target.value)}
                min="1"
                max="10000"
              />
              <p className="text-sm text-muted-foreground">Enter storage amount between 1 MB and 10,000 MB (10 GB)</p>
            </div>
          )}

          <Button onClick={createEmailAccount} disabled={creating} className="w-full md:w-auto">
            {creating ? "Creating..." : "Create Email Account"}
          </Button>
        </CardContent>
      </Card>

      {/* Email Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Accounts ({emailAccounts.length})
          </CardTitle>
          <CardDescription>Manage existing email accounts with detailed storage information</CardDescription>
        </CardHeader>
        <CardContent>
          {emailAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No email accounts found. Create your first email account above.
            </div>
          ) : (
            <div className="space-y-4">
              {emailAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{account.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(account.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right min-w-[120px]">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="h-4 w-4" />
                        {formatStorage(account.storageUsed)} / {formatStorage(account.storage)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(getStoragePercentage(account.storageUsed, account.storage), 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getStoragePercentage(account.storageUsed, account.storage)}% used
                      </div>
                    </div>

                    <Badge variant={account.status === "active" ? "default" : "destructive"}>{account.status}</Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEmailAccount(account.email)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
