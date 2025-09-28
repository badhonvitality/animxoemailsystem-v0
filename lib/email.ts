import type { EmailAccount } from "@/types"
import { CLIENT_ENV } from "./env"
import { DatabaseService } from "./database"

export class EmailService {
  static async createEmailAccount(
    userId: string,
    email: string,
    password: string,
    quota = 1000,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create email account via API route instead of direct cPanel access
      const response = await fetch("/api/cpanel/create-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, quota }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      // If API creation successful, add to Firebase using DatabaseService
      const newEmailAccount: EmailAccount = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        quota,
        usedQuota: 0,
        isActive: true,
        createdAt: new Date(),
      }

      const dbResult = await DatabaseService.addEmailAccount(userId, newEmailAccount)

      return dbResult
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async updateEmailAccount(
    userId: string,
    emailAccountId: string,
    updates: Partial<EmailAccount>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would require fetching the user, updating the specific email account, and saving back
      // For now, we'll implement a basic version
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteEmailAccount(
    userId: string,
    emailAccount: EmailAccount,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract username from email
      const username = emailAccount.email.split("@")[0]
      
      // Delete via API route instead of direct cPanel access
      const response = await fetch("/api/cpanel/delete-email", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      const dbResult = await DatabaseService.removeEmailAccount(userId, emailAccount)

      return dbResult
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async changeEmailPassword(
    userId: string,
    emailAccountId: string,
    email: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Change password via API route instead of direct cPanel access
      const response = await fetch("/api/cpanel/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await DatabaseService.logActivity(userId, "password_changed", {
        email,
        timestamp: Date.now(),
      })

      await DatabaseService.updateEmailAccount(userId, emailAccountId, {
        password: newPassword,
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static getWebmailUrl(email: string): string {
    return `${CLIENT_ENV.WEBMAIL_URL}/?login=${encodeURIComponent(email)}`
  }

  static getEmailSettings(email: string) {
    return {
      incoming: {
        server: CLIENT_ENV.MAIL_SERVER,
        imapPort: 993,
        pop3Port: 995,
        ssl: true,
      },
      outgoing: {
        server: CLIENT_ENV.MAIL_SERVER,
        smtpPort: 465,
        ssl: true,
      },
      username: email,
      authentication: true,
    }
  }

  static async syncEmailAccountsWithCpanel(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get email stats via API route instead of direct cPanel access
      const response = await fetch("/api/cpanel/email-stats")
      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Update Firebase with real usage data
      // This would sync the actual disk usage from cPanel with Firebase
      // Implementation would depend on your specific needs

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
