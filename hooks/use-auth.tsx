"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import type { User as FirebaseUser } from "firebase/auth"
import { AuthService } from "@/lib/auth"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      console.log("[v0] Auth state changed:", firebaseUser?.uid)
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await AuthService.getUserData(firebaseUser.uid)
        if (userData) {
          console.log("[v0] User data loaded:", userData.email)
          setUser(userData)
        } else {
          console.log("[v0] User data not found, creating profile")
          const result = await AuthService.createUserProfile(firebaseUser)
          if (result.success && result.userData) {
            console.log("[v0] User profile created successfully")
            setUser(result.userData as User)
          } else {
            console.error("[v0] Failed to create user profile:", result.error)
          }
        }
      } else {
        console.log("[v0] User signed out")
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    console.log("[v0] Sign in attempt for:", email, "Remember me:", rememberMe)
    const result = await AuthService.signIn(email, password, rememberMe)
    console.log("[v0] Sign in result:", result.success ? "success" : result.error)
    return result
  }

  const signOut = async () => {
    console.log("[v0] Sign out attempt")
    const result = await AuthService.signOut()
    if (result.success) {
      setUser(null)
      setFirebaseUser(null)
      console.log("[v0] Sign out successful")
    }
    return result
  }

  const resetPassword = async (email: string) => {
    console.log("[v0] Password reset attempt for:", email)
    return await AuthService.resetPassword(email)
  }

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
