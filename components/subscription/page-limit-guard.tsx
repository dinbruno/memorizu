"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileX, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getUserPlanLimits } from "@/lib/subscription-guard"
import { getUserPages } from "@/lib/firebase/firestore-service"

interface PageLimitGuardProps {
  children: React.ReactNode
  onLimitReached?: () => void
}

export function PageLimitGuard({ children, onLimitReached }: PageLimitGuardProps) {
  const { user } = useFirebase()
  const [pageCount, setPageCount] = useState(0)
  const [maxPages, setMaxPages] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [canCreateMore, setCanCreateMore] = useState(true)

  useEffect(() => {
    const checkLimits = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const [pages, limits] = await Promise.all([getUserPages(user.uid), getUserPlanLimits(user.uid)])

        setPageCount(pages.length)
        setMaxPages(limits.maxPages === Number.POSITIVE_INFINITY ? 999 : limits.maxPages)
        setCanCreateMore(pages.length < limits.maxPages)
      } catch (error) {
        console.error("Error checking page limits:", error)
        setCanCreateMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkLimits()
  }, [user])

  useEffect(() => {
    if (!canCreateMore && onLimitReached) {
      onLimitReached()
    }
  }, [canCreateMore, onLimitReached])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (canCreateMore) {
    return <>{children}</>
  }

  const progressPercentage = (pageCount / maxPages) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FileX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">Page Limit Reached</CardTitle>
          <CardDescription>You've reached your plan's page limit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pages used</span>
              <span>
                {pageCount} / {maxPages}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="text-sm text-muted-foreground">Upgrade to Pro for unlimited pages and premium features</div>

          <Button className="w-full" onClick={() => (window.location.href = "/dashboard/billing")}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
