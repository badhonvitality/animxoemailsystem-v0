import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore"
import { ref, set, get, push, onValue, off, serverTimestamp as rtdbServerTimestamp } from "firebase/database"
import { db, rtdb } from "./firebase"
import type { User, EmailAccount } from "@/types"

export class DatabaseService {
  // Firestore Operations
  static async createUser(userData: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", userData.uid!)
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailAccounts: [],
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        } as User
      }
      return null
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  static async updateUser(uid: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteUser(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, "users", uid))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate(),
      })) as User[]
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  // Email Account Operations
  static async addEmailAccount(
    userId: string,
    emailAccount: EmailAccount,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        emailAccounts: arrayUnion(emailAccount),
        updatedAt: serverTimestamp(),
      })

      // Also log the activity in real-time database
      await this.logActivity(userId, "email_created", {
        email: emailAccount.email,
        timestamp: Date.now(),
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async removeEmailAccount(
    userId: string,
    emailAccount: EmailAccount,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        emailAccounts: arrayRemove(emailAccount),
        updatedAt: serverTimestamp(),
      })

      // Log the activity
      await this.logActivity(userId, "email_deleted", {
        email: emailAccount.email,
        timestamp: Date.now(),
      })

      return { success: true }
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
      // Get current user data
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        return { success: false, error: "User not found" }
      }

      const userData = userDoc.data()
      const emailAccounts = userData.emailAccounts || []

      // Find and update the specific email account
      const updatedAccounts = emailAccounts.map((account: EmailAccount) =>
        account.id === emailAccountId ? { ...account, ...updates } : account,
      )

      // Update the user document
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        emailAccounts: updatedAccounts,
        updatedAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Real-time Database Operations
  static async logActivity(userId: string, action: string, data: any): Promise<void> {
    try {
      const activityRef = ref(rtdb, `activities/${userId}`)
      await push(activityRef, {
        action,
        data,
        timestamp: rtdbServerTimestamp(),
      })
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  static async getRecentActivities(userId: string, limitCount = 10): Promise<any[]> {
    try {
      const activityRef = ref(rtdb, `activities/${userId}`)
      const snapshot = await get(activityRef)

      if (snapshot.exists()) {
        const activities = Object.entries(snapshot.val())
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limitCount)

        return activities
      }
      return []
    } catch (error) {
      console.error("Error fetching activities:", error)
      return []
    }
  }

  static subscribeToActivities(userId: string, callback: (activities: any[]) => void): () => void {
    const activityRef = ref(rtdb, `activities/${userId}`)

    const unsubscribe = onValue(activityRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities = Object.entries(snapshot.val())
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

        callback(activities)
      } else {
        callback([])
      }
    })

    return () => off(activityRef, "value", unsubscribe)
  }

  // System Statistics
  static async updateSystemStats(): Promise<void> {
    try {
      const usersRef = collection(db, "users")
      const usersSnapshot = await getDocs(usersRef)

      let totalUsers = 0
      let totalEmailAccounts = 0
      let activeUsers = 0

      usersSnapshot.forEach((doc) => {
        const userData = doc.data()
        totalUsers++

        if (userData.emailAccounts) {
          totalEmailAccounts += userData.emailAccounts.length
        }

        const lastLogin = userData.lastLogin?.toDate()
        if (lastLogin) {
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceLogin <= 30) {
            activeUsers++
          }
        }
      })

      // Store stats in real-time database
      const statsRef = ref(rtdb, "systemStats")
      await set(statsRef, {
        totalUsers,
        totalEmailAccounts,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        lastUpdated: rtdbServerTimestamp(),
      })
    } catch (error) {
      console.error("Error updating system stats:", error)
    }
  }

  static async getSystemStats(): Promise<any> {
    try {
      const statsRef = ref(rtdb, "systemStats")
      const snapshot = await get(statsRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }

      // If no stats exist, calculate and store them
      await this.updateSystemStats()
      const newSnapshot = await get(statsRef)
      return newSnapshot.exists() ? newSnapshot.val() : {}
    } catch (error) {
      console.error("Error fetching system stats:", error)
      return {}
    }
  }

  // Batch Operations
  static async batchUpdateUsers(updates: Array<{ uid: string; data: Partial<User> }>): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const batch = writeBatch(db)

      updates.forEach(({ uid, data }) => {
        const userRef = doc(db, "users", uid)
        batch.update(userRef, {
          ...data,
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Search Operations
  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", ">=", searchTerm), where("email", "<=", searchTerm + "\uf8ff"))

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate(),
      })) as User[]
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  }

  // Real-time Subscriptions
  static subscribeToUser(uid: string, callback: (user: User | null) => void): () => void {
    const userRef = doc(db, "users", uid)

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        } as User)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    const usersRef = collection(db, "users")
    const q = query(usersRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate(),
      })) as User[]

      callback(users)
    })

    return unsubscribe
  }

  // Email Usage Tracking
  static async trackEmailUsage(userId: string, emailId: string, action: "sent" | "received" | "login"): Promise<void> {
    try {
      const usageRef = ref(rtdb, `emailUsage/${userId}/${emailId}/${action}`)
      await push(usageRef, {
        timestamp: rtdbServerTimestamp(),
      })
    } catch (error) {
      console.error("Error tracking email usage:", error)
    }
  }

  static async getEmailUsageStats(userId: string, emailId: string): Promise<any> {
    try {
      const usageRef = ref(rtdb, `emailUsage/${userId}/${emailId}`)
      const snapshot = await get(usageRef)

      if (snapshot.exists()) {
        const usage = snapshot.val()
        return {
          sent: Object.keys(usage.sent || {}).length,
          received: Object.keys(usage.received || {}).length,
          logins: Object.keys(usage.login || {}).length,
        }
      }

      return { sent: 0, received: 0, logins: 0 }
    } catch (error) {
      console.error("Error fetching email usage stats:", error)
      return { sent: 0, received: 0, logins: 0 }
    }
  }
}
