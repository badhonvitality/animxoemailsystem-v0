"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DeveloperCredits } from "@/components/developer-credits"
import { Mail, Plus, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  const emailAccountsCount = user?.emailAccounts?.length || 0

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || user?.email}</h1>
        <p className="text-muted-foreground">Manage your email accounts and settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border card-hover stagger-item">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Accounts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailAccountsCount}</div>
            <p className="text-xs text-muted-foreground">Active email accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border card-hover stagger-item">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.emailAccounts?.reduce((total, account) => total + account.usedQuota, 0) || 0} MB
            </div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border card-hover stagger-item">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/emails">
              <Button size="sm" className="w-full hover-lift button-press">
                <Plus className="mr-2 h-4 w-4" />
                Create Email
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent hover-lift button-press"
              onClick={() => window.open("https://webmail.animxo.com", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Webmail
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border card-hover">
          <CardHeader>
            <CardTitle>Recent Email Accounts</CardTitle>
            <CardDescription>Your most recently created email accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {emailAccountsCount === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No email accounts yet</h3>
                <p className="text-muted-foreground mb-4">Create your first email account to get started</p>
                <Link href="/dashboard/emails">
                  <Button className="hover-lift button-press">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Email Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {user?.emailAccounts?.slice(0, 3).map((account, index) => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 smooth-transition stagger-item`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{account.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.usedQuota} MB / {account.quota} MB used
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover-lift button-press bg-transparent"
                      onClick={() =>
                        window.open(`https://webmail.animxo.com/?login=${encodeURIComponent(account.email)}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ActivityFeed />

        <div className="md:col-span-1">
          <DeveloperCredits />
        </div>
      </div>
    </div>
  )
}
