export interface User {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
  createdAt: Date
  lastLogin?: Date
  emailAccounts: EmailAccount[]
}

export interface EmailAccount {
  id: string
  email: string
  password: string
  quota: number
  usedQuota: number
  isActive: boolean
  createdAt: Date
  lastAccessed?: Date
  isVerified?: boolean
  imapSettings?: {
    server: string
    port: number
    ssl: boolean
  }
  smtpSettings?: {
    server: string
    port: number
    ssl: boolean
  }
}

export interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  body: string
  isRead: boolean
  receivedAt: Date
  attachments?: EmailAttachment[]
  folder?: string
  size?: number
  uid?: number
}

export interface EmailAttachment {
  id: string
  filename: string
  size: number
  contentType: string
  url: string
}

export interface EmailFolder {
  name: string
  displayName: string
  messageCount: number
  unreadCount: number
}

export interface ComposeEmail {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  attachments?: File[]
}

export interface CpanelApiResponse {
  status: number
  data?: any
  errors?: string[]
  messages?: string[]
}
