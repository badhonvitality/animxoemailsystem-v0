import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "./firebase"
import type { User } from "@/types"

export class AdminService {
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

  static async createUser(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ success: boolean; error?: string; uid?: string }> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user profile in Firestore
      const userRef = doc(db, "users", firebaseUser.uid)
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || "",
        isAdmin: false,
        createdAt: new Date(),
        emailAccounts: [],
      }

      await updateDoc(userRef, userData)

      return { success: true, uid: firebaseUser.uid }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async updateUser(uid: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", uid)
      await updateDoc(userRef, updates)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteUser(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, "users", uid)
      await deleteDoc(userRef)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getSystemStats() {
    try {
      const usersRef = collection(db, "users")
      const allUsers = await getDocs(usersRef)

      const totalUsers = allUsers.size
      const activeUsers = allUsers.docs.filter((doc) => {
        const lastLogin = doc.data().lastLogin?.toDate()
        if (!lastLogin) return false
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceLogin <= 30
      }).length

      const totalEmailAccounts = allUsers.docs.reduce((total, doc) => {
        const emailAccounts = doc.data().emailAccounts || []
        return total + emailAccounts.length
      }, 0)

      return {
        totalUsers,
        activeUsers,
        totalEmailAccounts,
        inactiveUsers: totalUsers - activeUsers,
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalEmailAccounts: 0,
        inactiveUsers: 0,
      }
    }
  }

  static async getRecentActivity(limitCount = 10) {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, orderBy("lastLogin", "desc"), limit(limitCount))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName,
        lastLogin: doc.data().lastLogin?.toDate(),
      }))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
  }
}
