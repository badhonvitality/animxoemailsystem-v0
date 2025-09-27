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
}

export interface EmailAttachment {
  id: string
  filename: string
  size: number
  contentType: string
  url: string
}

export interface CpanelApiResponse {
  status: number
  data?: any
  errors?: string[]
  messages?: string[]
}
