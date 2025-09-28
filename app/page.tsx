"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeveloperCredits } from "@/components/developer-credits"
import { useAuth } from "@/hooks/use-auth"
import { Mail, Shield, Users, Settings, Database, Globe } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in-up">
              <Mail className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="text-2xl font-bold text-foreground">AnimXO Mail</h1>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              {loading ? (
                <div className="w-20 h-9 bg-muted animate-pulse rounded-md"></div>
              ) : user ? (
                <Link href="/dashboard">
                  <Button className="hover-lift button-press">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="hover-lift button-press bg-transparent">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 animate-gradient opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-balance animate-fade-in-up">
            Professional Email Management System
          </h2>
          <p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Manage unlimited email accounts with seamless cPanel integration, Firebase authentication, and real-time
            synchronization.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-3 hover-lift button-press animate-pulse-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Mail className="h-12 w-12 text-primary mb-4 smooth-transition hover:scale-110" />
                <CardTitle>Unlimited Email Accounts</CardTitle>
                <CardDescription>
                  Create and manage unlimited email accounts for your domain with full cPanel integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mb-4 smooth-transition hover:scale-110" />
                <CardTitle>Firebase Authentication</CardTitle>
                <CardDescription>
                  Secure authentication system with password reset functionality and admin controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4 smooth-transition hover:scale-110" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Admin dashboard for creating users, monitoring activity, and managing permissions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Settings className="h-12 w-12 text-accent mb-4 smooth-transition hover:scale-110" />
                <CardTitle>cPanel Integration</CardTitle>
                <CardDescription>
                  Direct integration with your cPanel hosting for seamless email account management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Database className="h-12 w-12 text-primary mb-4 smooth-transition hover:scale-110" />
                <CardTitle>Real-time Database</CardTitle>
                <CardDescription>
                  Firestore and Realtime Database integration for instant data synchronization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border card-hover stagger-item">
              <CardHeader>
                <Globe className="h-12 w-12 text-accent mb-4 smooth-transition hover:scale-110" />
                <CardTitle>Webmail Access</CardTitle>
                <CardDescription>
                  Direct webmail access integration for seamless email management experience.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer Credits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <DeveloperCredits />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2025 AnimXO Mail. Professional email management system.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Developed by <span className="font-semibold text-primary">Badhon Vitality</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
