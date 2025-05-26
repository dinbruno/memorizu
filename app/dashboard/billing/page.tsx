"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, Check, Star, Zap, ExternalLink, Calendar, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getUserData } from "@/lib/firebase/firestore-service"
import { STRIPE_CONFIG } from "@/lib/stripe/stripe-config"

interface Plan {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  popular?: boolean
  current?: boolean
  priceId?: string
}

export default function BillingPage() {
  const { user } = useFirebase()
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("")
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string>("")

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      interval: "forever",
      features: ["3 pages maximum", "Basic templates", "Standard components", "Community support", "Memorizu branding"],
    },
    {
      id: "pro",
      name: "Pro",
      price: STRIPE_CONFIG.plans.pro.price,
      interval: "month",
      popular: true,
      priceId: STRIPE_CONFIG.plans.pro.priceId,
      features: STRIPE_CONFIG.plans.pro.features,
    },
    {
      id: "business",
      name: "Business",
      price: STRIPE_CONFIG.plans.business.price,
      interval: "month",
      priceId: STRIPE_CONFIG.plans.business.priceId,
      features: STRIPE_CONFIG.plans.business.features,
    },
  ]

  useEffect(() => {
    const loadBillingData = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          if (userData) {
            setCurrentPlan(userData.plan || "free")
            setSubscriptionStatus(userData.subscriptionStatus || "")
            setCurrentPeriodEnd(userData.currentPeriodEnd ? new Date(userData.currentPeriodEnd) : null)
            setCancelAtPeriodEnd(userData.cancelAtPeriodEnd || false)
          }
        } catch (error) {
          console.error("Error loading billing data:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load billing information",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadBillingData()
  }, [user, toast])

  const handleUpgrade = async (planId: string, priceId?: string) => {
    if (!user || !priceId) return

    setProcessingPlan(planId)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          priceId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start checkout process",
      })
    } finally {
      setProcessingPlan("")
    }
  }

  const handleManageSubscription = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error opening customer portal:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open billing portal",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-96">
                <CardHeader>
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 w-full bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground mt-2">Choose the perfect plan for your needs</p>
        </div>

        {/* Subscription Status Alert */}
        {currentPlan !== "free" && (
          <Alert className={cancelAtPeriodEnd ? "border-destructive" : "border-primary"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {cancelAtPeriodEnd ? (
                <>
                  Your subscription will be canceled on {currentPeriodEnd?.toLocaleDateString()}. You'll still have
                  access until then.
                </>
              ) : (
                <>
                  Your {currentPlan} subscription is active and will renew on {currentPeriodEnd?.toLocaleDateString()}.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <Button
                    className="w-full"
                    variant={currentPlan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={currentPlan === plan.id || processingPlan === plan.id}
                    onClick={() => plan.priceId && handleUpgrade(plan.id, plan.priceId)}
                  >
                    {processingPlan === plan.id ? (
                      "Processing..."
                    ) : currentPlan === plan.id ? (
                      "Current Plan"
                    ) : plan.id === "free" ? (
                      "Downgrade"
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>Manage your subscription and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">
                  {plans.find((p) => p.id === currentPlan)?.name || "Free"}
                </p>
              </div>
              <Badge variant={currentPlan === "free" ? "secondary" : "default"}>
                {currentPlan === "free" ? "Free" : "Premium"}
              </Badge>
            </div>

            {currentPlan !== "free" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Subscription Status</p>
                  <p className="text-sm text-muted-foreground capitalize">{subscriptionStatus}</p>
                </div>

                {currentPeriodEnd && (
                  <>
                    <div className="space-y-2">
                      <p className="font-medium">{cancelAtPeriodEnd ? "Access until" : "Next billing date"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {currentPeriodEnd.toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </>
            )}

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need help with billing? Contact our support team for assistance.
              </p>
              <Button variant="outline" className="mt-2">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
