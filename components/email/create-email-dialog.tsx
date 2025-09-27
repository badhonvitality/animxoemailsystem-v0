"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailService } from "@/lib/email"
import { CLIENT_ENV } from "@/lib/env"
import { Plus, Copy, Eye, EyeOff, CheckCircle } from "lucide-react"

interface CreateEmailDialogProps {
  userId: string
  onEmailCreated: () => void
}

export function CreateEmailDialog({ userId, onEmailCreated }: CreateEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [quota, setQuota] = useState("1000")
  const [customQuota, setCustomQuota] = useState("")
  const [showCustomQuota, setShowCustomQuota] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createdEmail, setCreatedEmail] = useState<{ email: string; password: string } | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleCreateEmail = async () => {
    if (!username || !password) return

    let storageQuota = Number.parseInt(quota)
    if (quota === "custom") {
      if (!customQuota || Number.parseInt(customQuota) <= 0) {
        return
      }
      storageQuota = Number.parseInt(customQuota)
    }

    const email = `${username}@${CLIENT_ENV.DOMAIN}`

    setLoading(true)
    console.log("[v0] Creating email account:", { email, username, quota: storageQuota })

    const result = await EmailService.createEmailAccount(userId, email, password, storageQuota)

    if (result.success) {
      setCreatedEmail({ email, password })
      setIsOpen(false)
      setShowSuccessDialog(true)

      // Reset form
      setUsername("")
      setPassword("")
      setQuota("1000")
      setCustomQuota("")
      setShowCustomQuota(false)

      onEmailCreated()
    }

    setLoading(false)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(password)
  }

  const handleCopyPassword = async (passwordToCopy: string) => {
    try {
      await navigator.clipboard.writeText(passwordToCopy)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy password:", error)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    setCreatedEmail(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Email Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Account</DialogTitle>
            <DialogDescription>
              Create a new email account for your domain with flexible storage options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="flex">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="rounded-r-none"
                />
                <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                  @{CLIENT_ENV.DOMAIN}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="quota">Storage Quota</Label>
              <Select
                value={quota}
                onValueChange={(value) => {
                  setQuota(value)
                  setShowCustomQuota(value === "custom")
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
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                  <SelectItem value="2000">2 GB</SelectItem>
                  <SelectItem value="5000">5 GB</SelectItem>
                  <SelectItem value="10000">10 GB</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCustomQuota && (
              <div>
                <Label htmlFor="customQuota">Custom Storage (MB)</Label>
                <Input
                  id="customQuota"
                  type="number"
                  placeholder="Enter storage amount in MB"
                  value={customQuota}
                  onChange={(e) => setCustomQuota(e.target.value)}
                  min="1"
                  max="50000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter storage amount between 1 MB and 50,000 MB (50 GB)
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCreateEmail} disabled={loading || !username || !password}>
              {loading ? "Creating..." : "Create Email Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Email Account Created Successfully!
            </DialogTitle>
            <DialogDescription>Your email account has been created and is ready to use.</DialogDescription>
          </DialogHeader>
          {createdEmail && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="font-mono text-sm bg-muted p-3 rounded border flex items-center justify-between">
                  <span>{createdEmail.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPassword(createdEmail.email)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Password</Label>
                <div className="font-mono text-sm bg-muted p-3 rounded border flex items-center justify-between">
                  <span>{createdEmail.password}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPassword(createdEmail.password)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Important:</strong> Please save these credentials securely. You can access webmail and
                  configure your email client with these details.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSuccessDialogClose}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
