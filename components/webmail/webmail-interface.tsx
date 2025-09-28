"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Send, Inbox, Send as Sent, Trash2, CreditCard as Edit, Search, RefreshCw as Refresh, Reply, Forward, Archive, Star, Paperclip } from "lucide-react"
import type { EmailMessage, EmailFolder, ComposeEmail } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface WebmailInterfaceProps {
  emailAccount: string
  onClose?: () => void
}

export function WebmailInterface({ emailAccount, onClose }: WebmailInterfaceProps) {
  const [folders, setFolders] = useState<EmailFolder[]>([])
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [selectedFolder, setSelectedFolder] = useState("INBOX")
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [composeData, setComposeData] = useState<ComposeEmail>({
    to: [],
    subject: "",
    body: "",
  })

  useEffect(() => {
    loadFolders()
    loadMessages()
  }, [emailAccount, selectedFolder])

  const loadFolders = async () => {
    try {
      const response = await fetch(`/api/email/folders?email=${encodeURIComponent(emailAccount)}`)
      const result = await response.json()
      
      if (result.success) {
        setFolders(result.folders)
      }
    } catch (error) {
      console.error("Error loading folders:", error)
    }
  }

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/email/messages?email=${encodeURIComponent(emailAccount)}&folder=${selectedFolder}&limit=50`
      )
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.messages)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!composeData.to.length || !composeData.subject) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailAccount,
          to: composeData.to,
          cc: composeData.cc,
          bcc: composeData.bcc,
          subject: composeData.subject,
          body: composeData.body,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setIsComposing(false)
        setComposeData({ to: [], subject: "", body: "" })
        // Refresh messages if we're in the sent folder
        if (selectedFolder === "SENT") {
          loadMessages()
        }
      }
    } catch (error) {
      console.error("Error sending email:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (message: EmailMessage) => {
    setComposeData({
      to: [message.from],
      subject: `Re: ${message.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.body}`,
    })
    setIsComposing(true)
  }

  const handleForward = (message: EmailMessage) => {
    setComposeData({
      to: [],
      subject: `Fwd: ${message.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.body}`,
    })
    setIsComposing(true)
  }

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.body.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Webmail - {emailAccount}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadMessages} disabled={loading}>
            <Refresh className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsComposing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Compose
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-1">
              {folders.map((folder) => (
                <Button
                  key={folder.name}
                  variant={selectedFolder === folder.name ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(folder.name)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {folder.name === "INBOX" && <Inbox className="h-4 w-4" />}
                      {folder.name === "SENT" && <Send className="h-4 w-4" />}
                      {folder.name === "TRASH" && <Trash2 className="h-4 w-4" />}
                      {folder.name === "DRAFTS" && <Edit className="h-4 w-4" />}
                      <span>{folder.displayName}</span>
                    </div>
                    {folder.unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {folder.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="w-96 border-r border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">
              {folders.find(f => f.name === selectedFolder)?.displayName || selectedFolder}
            </h2>
          </div>
          
          <ScrollArea className="h-full">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-muted" : ""
                    } ${!message.isRead ? "font-semibold" : ""}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium truncate flex-1">
                        {message.from}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(new Date(message.receivedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {message.body.substring(0, 100)}...
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {!message.isRead && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Content */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReply(selectedMessage)}>
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleForward(selectedMessage)}>
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>From:</strong> {selectedMessage.from}</div>
                  <div><strong>To:</strong> {selectedMessage.to}</div>
                  <div><strong>Date:</strong> {new Date(selectedMessage.receivedAt).toLocaleString()}</div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedMessage.body.replace(/\n/g, '<br>') }} />
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={isComposing} onOpenChange={setIsComposing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>Send a new email from {emailAccount}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="recipient@example.com"
                value={composeData.to.join(", ")}
                onChange={(e) => setComposeData({
                  ...composeData,
                  to: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">CC</label>
                <Input
                  placeholder="cc@example.com"
                  value={composeData.cc?.join(", ") || ""}
                  onChange={(e) => setComposeData({
                    ...composeData,
                    cc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">BCC</label>
                <Input
                  placeholder="bcc@example.com"
                  value={composeData.bcc?.join(", ") || ""}
                  onChange={(e) => setComposeData({
                    ...composeData,
                    bcc: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({
                  ...composeData,
                  subject: e.target.value
                })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Type your message here..."
                value={composeData.body}
                onChange={(e) => setComposeData({
                  ...composeData,
                  body: e.target.value
                })}
                rows={10}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposing(false)}>
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={loading || !composeData.to.length || !composeData.subject}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}