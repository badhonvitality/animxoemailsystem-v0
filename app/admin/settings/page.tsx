"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Settings, Server, Mail, Shield, Database, Globe, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    systemName: "AnimXO Mail System",
    domain: "animxo.com",
    maxEmailsPerUser: 10,
    defaultQuota: 1000,
    maxQuota: 50000,
    enableRegistration: true,
    enableEmailVerification: false,
    maintenanceMode: false,
    smtpEnabled: true,
    imapEnabled: true,
    autoBackup: true,
    backupRetention: 30,
  })
  
  const [connectionStatus, setConnectionStatus] = useState({
    cpanel: "checking",
    firebase: "checking",
    smtp: "checking",
    imap: "checking",
  })
  
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkConnections()
  }, [])

  const checkConnections = async () => {
    // Check cPanel connection
    try {
      const cpanelResponse = await fetch("/api/test-cpanel")
      const cpanelResult = await cpanelResponse.json()
      setConnectionStatus(prev => ({
        ...prev,
        cpanel: cpanelResult.success ? "connected" : "error"
      }))
    } catch {
      setConnectionStatus(prev => ({ ...prev, cpanel: "error" }))
    }

    // Simulate other connection checks
    setTimeout(() => {
      setConnectionStatus(prev => ({
        ...prev,
        firebase: "connected",
        smtp: "connected",
        imap: "connected",
      }))
    }, 1000)
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-500">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Checking...</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and monitor connections</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Monitor the status of system connections and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.cpanel)}
                <span className="font-medium">cPanel API</span>
              </div>
              {getStatusBadge(connectionStatus.cpanel)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.firebase)}
                <span className="font-medium">Firebase</span>
              </div>
              {getStatusBadge(connectionStatus.firebase)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.smtp)}
                <span className="font-medium">SMTP</span>
              </div>
              {getStatusBadge(connectionStatus.smtp)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.imap)}
                <span className="font-medium">IMAP</span>
              </div>
              {getStatusBadge(connectionStatus.imap)}
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" onClick={checkConnections}>
              <Server className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={settings.enableEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, enableEmailVerification: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>Configure email-related settings and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="maxEmails">Max Emails per User</Label>
              <Input
                id="maxEmails"
                type="number"
                value={settings.maxEmailsPerUser}
                onChange={(e) => setSettings({ ...settings, maxEmailsPerUser: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="defaultQuota">Default Quota (MB)</Label>
              <Input
                id="defaultQuota"
                type="number"
                value={settings.defaultQuota}
                onChange={(e) => setSettings({ ...settings, defaultQuota: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="maxQuota">Maximum Quota (MB)</Label>
              <Input
                id="maxQuota"
                type="number"
                value={settings.maxQuota}
                onChange={(e) => setSettings({ ...settings, maxQuota: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>SMTP Service</Label>
                <p className="text-sm text-muted-foreground">Enable outgoing email functionality</p>
              </div>
              <Switch
                checked={settings.smtpEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, smtpEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>IMAP Service</Label>
                <p className="text-sm text-muted-foreground">Enable incoming email functionality</p>
              </div>
              <Switch
                checked={settings.imapEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, imapEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Maintenance
          </CardTitle>
          <CardDescription>Configure backup and maintenance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Enable automatic daily backups</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>
          
          <div>
            <Label htmlFor="backupRetention">Backup Retention (days)</Label>
            <Input
              id="backupRetention"
              type="number"
              value={settings.backupRetention}
              onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) })}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}