"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, MessageCircle, User } from "lucide-react"

export function DeveloperCredits() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/badhonvitality",
      icon: Github,
      color: "bg-gray-800 hover:bg-gray-900",
    },
    {
      name: "Discord",
      url: "https://discord.com/users/1121859070488498196",
      icon: MessageCircle,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      name: "Facebook",
      url: "https://facebook.com/Badhon.Vitality",
      icon: ExternalLink,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Bio",
      url: "https://guns.lol/badhon",
      icon: User,
      color: "bg-green-500 hover:bg-green-600",
    },
  ]

  return (
    <Card className="bg-card border-border card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Developer Credits
        </CardTitle>
        <CardDescription>Built with passion and dedication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Badhon Vitality</h3>
            <p className="text-sm text-muted-foreground">Full Stack Developer</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              size="sm"
              className={`${link.color} text-white border-0 hover-lift button-press smooth-transition`}
              onClick={() => window.open(link.url, "_blank")}
            >
              <link.icon className="h-4 w-4 mr-2" />
              {link.name}
            </Button>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <Badge variant="secondary" className="text-xs">
            AnimXO Email System v1.0
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
