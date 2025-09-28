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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatabaseService } from "@/lib/database"
import { CLIENT_ENV } from "@/lib/env"
import { Plus, Eye, EyeOff, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react"
import type { EmailAccount } from "@/types"

interface AddExistingEmailDialogProps {
  userId: string
  onEmailAdded: () => void
}

export function AddExistingEmailDialog({ userId, onEmailAdded }: AddExistingEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleVerifyAndAdd = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    // Ensure email ends with the correct domain
    if (!email.endsWith(`@${CLIENT_ENV.DOMAIN}`)) {
      setError(`Email must be for the ${CLIENT_ENV.DOMAIN} domain`)
      return
    }

    setVerifying(true)
    setError("")
    setSuccess("")

    try {
      // First verify the email credentials
      const verifyResponse = await fetch("/api/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.success) {
        setError(verifyResult.error || "Failed to verify email credentials")
        return
      }

      setSuccess("Email credentials verified successfully!")
      
      // Add a small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000))

      setLoading(true)

      // Create the email account object
      const newEmailAccount: EmailAccount = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        quota: 1000, // Default quota, will be updated from cPanel
        usedQuota: 0,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        imapSettings: verifyResult.settings?.imap,
        smtpSettings: verifyResult.settings?.smtp,
      }

      // Add to Firebase
      const dbResult = await DatabaseService.addEmailAccount(userId, newEmailAccount)

      if (dbResult.success) {
        setSuccess("Email account added successfully!")
        
        // Reset form
        setEmail("")
        setPassword("")
        setShowPassword(false)
        
        // Close dialog after a short delay
        setTimeout(() => {
          setIsOpen(false)
          setSuccess("")
          onEmailAdded()
        }, 1500)
      } else {
        setError(dbResult.error || "Failed to add email account")
      }
    } catch (error: any) {
      console.error("Error adding existing email:", error)
      setError("Failed to add email account")
    } finally {
      setVerifying(false)
      setLoading(false)
    }
  }

  const handleDialogClose = () => {
    setIsOpen(false)
    setEmail("")
    setPassword("")
    setShowPassword(false)
    setError("")
    setSuccess("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Existing Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Existing Email Account</DialogTitle>
          <DialogDescription>
            Add an email account that already exists in your cPanel. We'll verify the credentials before adding it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="existing-email">Email Address</Label>
            <div className="flex">
              <Input
                id="existing-email"
                type="email"
                placeholder="admin"
                value={email.split("@")[0]}
                onChange={(e) => setEmail(`${e.target.value}@${CLIENT_ENV.DOMAIN}`)}
                className="rounded-r-none"
                disabled={verifying || loading}
              />
              <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                @{CLIENT_ENV.DOMAIN}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="existing-password">Password</Label>
            <div className="relative">
              <Input
                id="existing-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter email password"
                className="pr-10"
                disabled={verifying || loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                disabled={verifying || loading}
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> This will verify your email credentials and add the account to your dashboard for management.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleVerifyAndAdd} 
            disabled={verifying || loading || !email || !password}
            className="w-full"
          >
            {verifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              "Verify & Add Email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}