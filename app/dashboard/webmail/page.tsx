"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WebmailInterface } from "@/components/webmail/webmail-interface"
import { Mail, ExternalLink } from "lucide-react"

export default function WebmailPage() {
  const { user } = useAuth()
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)

  const emailAccounts = user?.emailAccounts || []

  if (selectedEmail) {
    return (
      <WebmailInterface 
        emailAccount={selectedEmail} 
        onClose={() => setSelectedEmail(null)}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Webmail</h1>
        <p className="text-muted-foreground">Access your email accounts directly from the dashboard</p>
      </div>

      {emailAccounts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              No Email Accounts
            </CardTitle>
            <CardDescription>
              You need to create or add email accounts before accessing webmail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Started with Email</h3>
              <p className="text-muted-foreground mb-6">
                Create your first email account or add an existing one to start using webmail
              </p>
              <Button onClick={() => window.location.href = '/dashboard/emails'}>
                <Mail className="mr-2 h-4 w-4" />
                Manage Email Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {emailAccounts.map((account) => (
            <Card key={account.id} className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {account.email}
                </CardTitle>
                <CardDescription>
                  {account.usedQuota} MB / {account.quota} MB used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((account.usedQuota / account.quota) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setSelectedEmail(account.email)}
                      className="flex-1"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Open Webmail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://webmail.animxo.com/?login=${encodeURIComponent(account.email)}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}