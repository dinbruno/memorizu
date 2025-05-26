"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Lock, Crown, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getUserPlanLimits, type SubscriptionLimits } from "@/lib/subscription-guard"

interface SubscriptionGuardProps {
  feature: keyof SubscriptionLimits
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function SubscriptionGuard({ feature, children, fallback, showUpgrade = true }: SubscriptionGuardProps) {
  const { user } = useFirebase()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      try {
        const limits = await getUserPlanLimits(user.uid)
        setHasAccess(limits[feature] as boolean)
      } catch (error) {
        console.error("Error checking subscription access:", error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, feature])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgrade) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Premium Feature
          </CardTitle>
          <CardDescription>This feature is available for Pro and Business subscribers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {feature === "canRemoveBranding" && "Remove Branding"}
              {feature === "hasCustomDomain" && "Custom Domain"}
              {feature === "hasAnalytics" && "Analytics"}
              {feature === "hasPrioritySupport" && "Priority Support"}
            </Badge>
          </div>

          <Button className="w-full" onClick={() => (window.location.href = "/dashboard/billing")}>
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
