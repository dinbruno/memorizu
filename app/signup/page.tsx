"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useLanguage()
  const { signUp } = useFirebase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await signUp(email, password)

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        plan: "free",
        pagesCount: 0,
      })

      toast({
        title: "Account created!",
        description: "Welcome to Memorizu!",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notification.error"),
        description: (error as Error).message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("auth.signup")}</CardTitle>
              <CardDescription>
                {t("auth.hasAccount")}{" "}
                <Link href="/login" className="text-primary hover:underline">
                  {t("auth.login")}
                </Link>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : t("auth.signup")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
