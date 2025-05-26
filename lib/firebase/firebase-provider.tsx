"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth, initializeAnalytics } from "./firebase-config"

interface FirebaseContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize analytics
    initializeAnalytics()

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
