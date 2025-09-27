import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { User } from "@/types"
import { CLIENT_ENV } from "./env"

export class AuthService {
  static async signIn(email: string, password: string, rememberMe = false) {
    try {
      console.log("[v0] Starting sign in process for:", email, "Remember me:", rememberMe)

      // Set persistence based on remember me option
      if (rememberMe) {
        // Set persistence to LOCAL (persists until explicitly signed out)
        await setPersistence(auth, browserLocalPersistence)
        console.log("[v0] Set persistence to LOCAL for 30-day remember me")
      } else {
        // Set persistence to SESSION (persists only for the session)
        await setPersistence(auth, browserSessionPersistence)
        console.log("[v0] Set persistence to SESSION")
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("[v0] Firebase auth successful, user ID:", user.uid)

      const profileResult = await this.createUserProfile(user)
      console.log("[v0] User profile creation result:", profileResult)

      // Only update last login if profile exists or was created successfully
      if (profileResult.success) {
        setTimeout(async () => {
          await this.updateLastLogin(user.uid, rememberMe)
          console.log("[v0] Last login updated successfully")
        }, 100)
      }

      return { success: true, user }
    } catch (error: any) {
      console.error("[v0] Sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  static async signOut() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid,
          email: data.email,
          displayName: data.displayName,
          isAdmin: data.isAdmin || uid === CLIENT_ENV.ADMIN_UID,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          emailAccounts: data.emailAccounts || [],
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  static async createUserProfile(firebaseUser: FirebaseUser, additionalData: Partial<User> = {}) {
    try {
      console.log("[v0] Creating user profile for:", firebaseUser.uid)
      const userRef = doc(db, "users", firebaseUser.uid)

      // Check if user document already exists
      const existingDoc = await getDoc(userRef)
      if (existingDoc.exists()) {
        console.log("[v0] User profile already exists")
        return { success: true, userData: existingDoc.data() }
      }

      console.log("[v0] Creating new user profile")
      const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || additionalData.displayName || firebaseUser.email?.split("@")[0],
        isAdmin: firebaseUser.uid === CLIENT_ENV.ADMIN_UID,
        createdAt: new Date(),
        lastLogin: new Date(),
        emailAccounts: [],
        ...additionalData,
      }

      await setDoc(userRef, userData)
      console.log("[v0] User profile created successfully")
      return { success: true, userData }
    } catch (error: any) {
      console.error("[v0] Error creating user profile:", error)
      return { success: false, error: error.message }
    }
  }

  static async updateLastLogin(uid: string, rememberMe = false) {
    try {
      console.log("[v0] Updating last login for:", uid, "Remember me:", rememberMe)
      const userRef = doc(db, "users", uid)

      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const updateData: any = {
          lastLogin: new Date(),
        }

        // If remember me is enabled, set expiration to 30 days from now
        if (rememberMe) {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 30)
          updateData.rememberMeExpiration = expirationDate
        }

        await updateDoc(userRef, updateData)
        console.log("[v0] Last login updated successfully")
      } else {
        console.warn("[v0] User document does not exist, cannot update last login:", uid)
        // Try to create the user profile if it doesn't exist
        const firebaseUser = auth.currentUser
        if (firebaseUser && firebaseUser.uid === uid) {
          console.log("[v0] Attempting to create missing user profile")
          await this.createUserProfile(firebaseUser)
        }
      }
    } catch (error) {
      console.error("[v0] Error updating last login:", error)
    }
  }

  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }
}
