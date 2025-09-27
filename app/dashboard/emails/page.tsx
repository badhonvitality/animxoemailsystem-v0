"use client"

import { useAuth } from "@/hooks/use-auth"
import { EmailAccountCard } from "@/components/email/email-account-card"
import { CreateEmailDialog } from "@/components/email/create-email-dialog"
import { Mail } from "lucide-react"

export default function EmailsPage() {
  const { user } = useAuth()

  const handleEmailUpdate = () => {
    // This would trigger a refresh of user data
    // For now, we'll rely on the auth context to handle updates
    window.location.reload()
  }

  const emailAccounts = user?.emailAccounts || []

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Accounts</h1>
          <p className="text-muted-foreground">Manage your email accounts and settings</p>
        </div>
        <CreateEmailDialog userId={user?.uid || ""} onEmailCreated={handleEmailUpdate} />
      </div>

      {emailAccounts.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No email accounts yet</h3>
          <p className="text-muted-foreground mb-6">Create your first email account to get started with AnimXO Mail</p>
          <CreateEmailDialog userId={user?.uid || ""} onEmailCreated={handleEmailUpdate} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emailAccounts.map((emailAccount) => (
            <EmailAccountCard
              key={emailAccount.id}
              emailAccount={emailAccount}
              userId={user?.uid || ""}
              onUpdate={handleEmailUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
