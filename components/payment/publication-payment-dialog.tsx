"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Shield, Zap, Globe, CheckCircle } from "lucide-react"
import { PUBLICATION_CONFIG } from "@/lib/stripe/publication-service"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PublicationPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  pageTitle: string
  userId: string
}

export function PublicationPaymentDialog({
  open,
  onOpenChange,
  pageId,
  pageTitle,
  userId,
}: PublicationPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/publish-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          pageId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Publish Your Page
          </DialogTitle>
          <DialogDescription>Make your page accessible to the world with a one-time publication fee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Page Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Page Details</h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Title:</strong> {pageTitle || "Untitled Page"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>URL:</strong> memorizu.com/p/{userId}/{pageId}
            </p>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Publication Fee</span>
              <div className="text-right">
                <div className="text-2xl font-bold">${PUBLICATION_CONFIG.price}</div>
                <div className="text-xs text-muted-foreground">One-time payment</div>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Permanent public URL</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile-responsive design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Fast global CDN delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>SSL security certificate</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Accepted Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Visa</Badge>
              <Badge variant="outline">Mastercard</Badge>
              <Badge variant="outline">American Express</Badge>
              <Badge variant="outline">Apple Pay</Badge>
              <Badge variant="outline">Google Pay</Badge>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payment</p>
              <p className="text-blue-700 dark:text-blue-300">
                Your payment is processed securely by Stripe. We never store your card details.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handlePayment} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Pay ${PUBLICATION_CONFIG.price} & Publish
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
