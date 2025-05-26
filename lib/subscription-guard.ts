import { getUserData } from "@/lib/firebase/firestore-service"

export interface SubscriptionLimits {
  maxPages: number
  canRemoveBranding: boolean
  hasCustomDomain: boolean
  hasAnalytics: boolean
  hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    maxPages: 3,
    canRemoveBranding: false,
    hasCustomDomain: false,
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxPages: Number.POSITIVE_INFINITY,
    canRemoveBranding: true,
    hasCustomDomain: true,
    hasAnalytics: true,
    hasPrioritySupport: true,
  },
  business: {
    maxPages: Number.POSITIVE_INFINITY,
    canRemoveBranding: true,
    hasCustomDomain: true,
    hasAnalytics: true,
    hasPrioritySupport: true,
  },
}

export async function checkSubscriptionAccess(userId: string, feature: keyof SubscriptionLimits) {
  try {
    const userData = await getUserData(userId)
    const plan = userData?.plan || "free"
    const limits = PLAN_LIMITS[plan]

    // Check if subscription is active
    if (plan !== "free") {
      const currentPeriodEnd = userData?.currentPeriodEnd
      const subscriptionStatus = userData?.subscriptionStatus

      if (subscriptionStatus !== "active" || (currentPeriodEnd && new Date() > new Date(currentPeriodEnd))) {
        // Subscription expired or inactive, downgrade to free
        return PLAN_LIMITS.free[feature]
      }
    }

    return limits[feature]
  } catch (error) {
    console.error("Error checking subscription access:", error)
    return PLAN_LIMITS.free[feature] // Default to free plan on error
  }
}

export async function checkPageLimit(userId: string, currentPageCount: number) {
  const maxPages = await checkSubscriptionAccess(userId, "maxPages")
  return currentPageCount < maxPages
}

export async function getUserPlanLimits(userId: string): Promise<SubscriptionLimits> {
  try {
    const userData = await getUserData(userId)
    const plan = userData?.plan || "free"

    // Check if subscription is active
    if (plan !== "free") {
      const currentPeriodEnd = userData?.currentPeriodEnd
      const subscriptionStatus = userData?.subscriptionStatus

      if (subscriptionStatus !== "active" || (currentPeriodEnd && new Date() > new Date(currentPeriodEnd))) {
        return PLAN_LIMITS.free
      }
    }

    return PLAN_LIMITS[plan] || PLAN_LIMITS.free
  } catch (error) {
    console.error("Error getting user plan limits:", error)
    return PLAN_LIMITS.free
  }
}
