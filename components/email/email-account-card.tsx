"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmailService } from "@/lib/email"
import type { EmailAccount } from "@/types"
import { Mail, MoreVertical, ExternalLink, Key, Trash2, Settings, Copy, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EmailAccountCardProps {
  emailAccount: EmailAccount
  userId: string
  onUpdate: () => void
}

export function EmailAccountCard({ emailAccount, userId, onUpdate }: EmailAccountCardProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const quotaPercentage = (emailAccount.usedQuota / emailAccount.quota) * 100

  const handleOpenWebmail = () => {
    const webmailUrl = EmailService.getWebmailUrl(emailAccount.email)
    window.open(webmailUrl, "_blank")
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(emailAccount.password)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy password:", error)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword) return

    setLoading(true)
    const result = await EmailService.changeEmailPassword(userId, emailAccount.id, emailAccount.email, newPassword)

    if (result.success) {
      setIsPasswordDialogOpen(false)
      setNewPassword("")
      onUpdate()
    }

    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${emailAccount.email}? This will permanently delete the email account from cPanel.`,
      )
    )
      return

    setLoading(true)
    const result = await EmailService.deleteEmailAccount(userId, emailAccount)

    if (result.success) {
      onUpdate()
    }

    setLoading(false)
  }

  const emailSettings = EmailService.getEmailSettings(emailAccount.email)

  const formatSafeDate = (date: any) => {
    try {
      if (!date) return "Never"

      // Handle Firestore timestamp
      if (date && typeof date === "object" && date.toDate) {
        return formatDistanceToNow(date.toDate(), { addSuffix: true })
      }

      // Handle regular Date object
      if (date instanceof Date) {
        return formatDistanceToNow(date, { addSuffix: true })
      }

      // Handle string dates
      if (typeof date === "string") {
        const parsedDate = new Date(date)
        if (!isNaN(parsedDate.getTime())) {
          return formatDistanceToNow(parsedDate, { addSuffix: true })
        }
      }

      return "Unknown"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown"
    }
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{emailAccount.email}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={emailAccount.isActive ? "default" : "secondary"}>
              {emailAccount.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenWebmail}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Webmail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Email Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteAccount} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Password</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-6 w-6 p-0"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyPassword} className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {showPassword ? emailAccount.password : "••••••••••••"}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Used</span>
                <span>
                  {emailAccount.usedQuota} MB / {emailAccount.quota} MB
                </span>
              </div>
              <Progress value={quotaPercentage} className="h-2" />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Created</span>
              <span>{formatSafeDate(emailAccount.createdAt)}</span>
            </div>

            {emailAccount.lastAccessed && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last Accessed</span>
                <span>{formatSafeDate(emailAccount.lastAccessed)}</span>
              </div>
            )}

            <Button onClick={handleOpenWebmail} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Webmail
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Change the password for {emailAccount.email}. This will update the password in cPanel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={loading || !newPassword}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Settings</DialogTitle>
            <DialogDescription>Configuration settings for {emailAccount.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Incoming Mail Server (IMAP/POP3)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Server</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.incoming.server}</p>
                </div>
                <div>
                  <Label>IMAP Port</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.incoming.imapPort}</p>
                </div>
                <div>
                  <Label>POP3 Port</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.incoming.pop3Port}</p>
                </div>
                <div>
                  <Label>SSL/TLS</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.incoming.ssl ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Outgoing Mail Server (SMTP)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Server</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.outgoing.server}</p>
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.outgoing.smtpPort}</p>
                </div>
                <div>
                  <Label>SSL/TLS</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.outgoing.ssl ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label>Authentication</Label>
                  <p className="font-mono bg-muted p-2 rounded">{emailSettings.authentication ? "Required" : "None"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Account Details</h4>
              <div className="text-sm">
                <Label>Username</Label>
                <p className="font-mono bg-muted p-2 rounded">{emailSettings.username}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
