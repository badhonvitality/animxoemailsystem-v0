import type { CpanelApiResponse } from "@/types"

// This class should only be used in API routes (server-side)
export class CpanelAPI {
  private static getServerConfig() {
    return {
      baseUrl: process.env.NEXT_PUBLIC_CPANEL_URL || "https://power.mywhiteserver.com:2083",
      apiToken: process.env.CPANEL_API_TOKEN || "GNVY8H1RCNYF9YSIXWNA6COJSUAA77GI",
      cpanelUser: process.env.CPANEL_USER || "animxoco",
      domain: process.env.NEXT_PUBLIC_DOMAIN || "animxo.com",
    }
  }

  private static async makeRequest(
    module: string,
    func: string,
    params: Record<string, any> = {},
  ): Promise<CpanelApiResponse> {
    try {
      const config = this.getServerConfig()

      if (!config.apiToken) {
        throw new Error("CPANEL_API_TOKEN is not configured")
      }
      if (!config.cpanelUser) {
        throw new Error("CPANEL_USER is not configured")
      }

      const url = `${config.baseUrl}/execute/${module}/${func}`

      const requestParams = {
        ...params,
      }

      console.log("[v0] Making cPanel API request:", {
        url,
        module,
        func,
        user: config.cpanelUser,
        hasToken: !!config.apiToken,
        tokenLength: config.apiToken?.length || 0,
        params: requestParams,
      })

      const formData = new URLSearchParams()
      Object.entries(requestParams).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `cpanel ${config.cpanelUser}:${config.apiToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "AnimXo-Email-System/1.0",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("[v0] cPanel API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorBody.substring(0, 500), // Log first 500 chars of error
        })

        // Check for specific authentication errors
        if (response.status === 401) {
          throw new Error("Authentication failed - check CPANEL_API_TOKEN and CPANEL_USER")
        }

        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] cPanel API response:", data)

      if (data.result) {
        return {
          status: response.status,
          data: data.result.data,
          errors: data.result.errors,
          messages: data.result.messages,
        }
      } else if (data.data !== undefined) {
        return {
          status: response.status,
          data: data.data,
          errors: data.errors,
          messages: data.messages,
        }
      } else {
        // Handle direct response format
        return {
          status: response.status,
          data: data,
          errors: data.errors || [],
          messages: data.messages || [],
        }
      }
    } catch (error: any) {
      console.error("[v0] cPanel API request failed:", error)
      return {
        status: 500,
        errors: [error.message],
      }
    }
  }

  // Email Account Management
  static async createEmailAccount(
    username: string,
    password: string,
    quota = 25,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const config = this.getServerConfig()
      const targetDomain = config.domain
      const fullEmail = `${username}@${targetDomain}`

      if (!username || username.includes("@") || username.includes(" ")) {
        return { success: false, error: "Invalid username format" }
      }

      if (!targetDomain || targetDomain === "*") {
        return { success: false, error: "Invalid domain configuration" }
      }

      console.log("[v0] Creating email account:", {
        username,
        fullEmail,
        domain: targetDomain,
        quota,
      })

      const result = await this.makeRequest("Email", "add_pop", {
        email: username, // Pass only username, not full email address
        domain: targetDomain, // Explicitly pass domain
        password: password,
        quota: quota,
      })

      if (result.status === 200) {
        if (result.errors && result.errors.length > 0) {
          console.error("[v0] Email creation failed:", result.errors)
          return { success: false, error: result.errors[0] }
        } else {
          console.log("[v0] Email account created successfully:", result.data)
          return { success: true }
        }
      } else {
        console.error("[v0] Email creation failed with status:", result.status, result.errors)
        return { success: false, error: result.errors?.[0] || "Failed to create email account" }
      }
    } catch (error: any) {
      console.error("[v0] Email creation error:", error)
      return { success: false, error: error.message }
    }
  }

  static async deleteEmailAccount(username: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? "animxo.com" : config.domain
      const fullEmail = `${username}@${targetDomain}`

      console.log("[v0] Deleting email account:", { username, fullEmail, domain: targetDomain })

      const result = await this.makeRequest("Email", "delete_pop", {
        email: username, // Pass only username, not full email address
        domain: targetDomain,
      })

      if (result.status === 200) {
        console.log("[v0] Email account deleted successfully")
        return { success: true }
      } else {
        console.error("[v0] Email deletion failed:", result.errors)
        return { success: false, error: result.errors?.[0] || "Failed to delete email account" }
      }
    } catch (error: any) {
      console.error("[v0] Email deletion error:", error)
      return { success: false, error: error.message }
    }
  }

  static async changeEmailPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [username, domain] = email.split("@")
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? domain : config.domain

      console.log("[v0] Changing email password:", { username, domain: targetDomain })

      const result = await this.makeRequest("Email", "passwd_pop", {
        email: username, // Pass only username, not full email address
        domain: targetDomain,
        password: newPassword,
      })

      if (result.status === 200) {
        console.log("[v0] Email password changed successfully")
        return { success: true }
      } else {
        console.error("[v0] Password change failed:", result.errors)
        return { success: false, error: result.errors?.[0] || "Failed to change password" }
      }
    } catch (error: any) {
      console.error("[v0] Password change error:", error)
      return { success: false, error: error.message }
    }
  }

  static async getEmailAccountInfo(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [username, domain] = email.split("@")
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? domain : config.domain

      const result = await this.makeRequest("Email", "list_pops", {
        domain: targetDomain,
      })

      if (result.status === 200 && result.data) {
        const emailAccount = result.data.find((account: any) => account.email === email)
        return { success: true, data: emailAccount }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to get email account info" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async updateEmailQuota(email: string, quota: number): Promise<{ success: boolean; error?: string }> {
    try {
      const [username, domain] = email.split("@")
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? domain : config.domain

      console.log("[v0] Updating email quota:", { username, domain: targetDomain, quota })

      const result = await this.makeRequest("Email", "edit_pop_quota", {
        email: username, // Pass only username, not full email address
        domain: targetDomain,
        quota: quota,
      })

      if (result.status === 200) {
        console.log("[v0] Email quota updated successfully")
        return { success: true }
      } else {
        console.error("[v0] Quota update failed:", result.errors)
        return { success: false, error: result.errors?.[0] || "Failed to update quota" }
      }
    } catch (error: any) {
      console.error("[v0] Quota update error:", error)
      return { success: false, error: error.message }
    }
  }

  // Domain Management
  static async listDomains(): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      const result = await this.makeRequest("DomainInfo", "list_domains")

      if (result.status === 200 && result.data) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to list domains" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email Statistics
  static async getEmailStats(domain?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const config = this.getServerConfig()
      const targetDomain = domain || (config.domain === "*" ? "animxo.com" : config.domain)

      const result = await this.makeRequest("Email", "list_pops", {
        domain: targetDomain,
      })

      if (result.status === 200 && result.data) {
        const stats = {
          totalAccounts: result.data.length,
          totalQuotaUsed: result.data.reduce((total: number, account: any) => total + (account.diskused || 0), 0),
          totalQuotaLimit: result.data.reduce((total: number, account: any) => total + (account.quota || 0), 0),
          accounts: result.data,
        }
        return { success: true, data: stats }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to get email stats" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email Forwarders
  static async createEmailForwarder(email: string, destination: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [username, domain] = email.split("@")
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? domain : config.domain

      const result = await this.makeRequest("Email", "add_forwarder", {
        domain: targetDomain,
        email: `${username}@${targetDomain}`, // Use full email address
        fwdopt: "fwd",
        fwdemail: destination,
      })

      if (result.status === 200) {
        return { success: true }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to create forwarder" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteEmailForwarder(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [username, domain] = email.split("@")
      const config = this.getServerConfig()
      const targetDomain = config.domain === "*" ? domain : config.domain

      const result = await this.makeRequest("Email", "delete_forwarder", {
        domain: targetDomain,
        email: `${username}@${targetDomain}`, // Use full email address
      })

      if (result.status === 200) {
        return { success: true }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to delete forwarder" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email Filters
  static async createEmailFilter(
    email: string,
    filterName: string,
    rules: any[],
    actions: any[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest("Email", "store_filter", {
        account: email,
        filtername: filterName,
        rules: JSON.stringify(rules),
        actions: JSON.stringify(actions),
      })

      if (result.status === 200) {
        return { success: true }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to create email filter" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Disk Usage
  static async getDiskUsage(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.makeRequest("Quota", "get_quota_info")

      if (result.status === 200 && result.data) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.errors?.[0] || "Failed to get disk usage" }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // API Connection Test
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest("StatsBar", "get_stats")

      if (result.status === 200) {
        return { success: true }
      } else {
        return {
          success: false,
          error: result.errors?.[0] || `API test failed with status ${result.status}`,
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email Account Management
  static async listEmailAccounts(): Promise<any[]> {
    try {
      const config = this.getServerConfig()
      const targetDomain = config.domain

      const result = await this.makeRequest("Email", "list_pops_with_disk")

      if (result.status === 200 && result.data) {
        // Transform the data to match our expected format
        return result.data
          .filter((account: any) => account.domain === targetDomain)
          .map((account: any) => ({
            id: account.email || `${account.user}@${targetDomain}`,
            email: account.email || `${account.user}@${targetDomain}`,
            storage: Number.parseInt(account.quota) || 25,
            storageUsed: Number.parseInt(account.diskused) || 0,
            status: account.suspended ? "suspended" : "active",
            createdAt: new Date().toISOString(), // cPanel doesn't provide creation date
          }))
      } else {
        console.error("[v0] Failed to list email accounts:", result.errors)
        return []
      }
    } catch (error: any) {
      console.error("[v0] Error listing email accounts:", error)
      return []
    }
  }
}
