"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { useFirebase } from "@/lib/firebase/firebase-provider"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()
  const { resetPassword } = useFirebase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSent(true)
      toast({
        title: t("auth.resetSent"),
      })
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
              <CardTitle>{t("auth.reset")}</CardTitle>
              <CardDescription>{isSent ? t("auth.resetSent") : t("auth.resetInstructions")}</CardDescription>
            </CardHeader>
            {!isSent && (
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : t("auth.reset")}
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/login">{t("auth.login")}</Link>
                  </Button>
                </CardFooter>
              </form>
            )}
            {isSent && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">{t("auth.login")}</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
