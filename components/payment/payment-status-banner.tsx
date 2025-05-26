"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface PaymentStatusBannerProps {
  pageId: string
  userId: string
}

export function PaymentStatusBanner({ pageId, userId }: PaymentStatusBannerProps) {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const paymentStatus = searchParams.get("payment")
    if (paymentStatus) {
      setStatus(paymentStatus)
      // Clear the URL parameter after showing the message
      const url = new URL(window.location.href)
      url.searchParams.delete("payment")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  if (!status) return null

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          variant: "default" as const,
          title: "Payment Successful!",
          description: "Your page has been published and is now live.",
          action: (
            <Button variant="outline" size="sm" asChild>
              <a href={`/p/${userId}/${pageId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live Page
              </a>
            </Button>
          ),
        }
      case "canceled":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          title: "Payment Canceled",
          description: "Your payment was canceled. Your page has not been published.",
          action: null,
        }
      case "failed":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
          action: null,
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <Alert variant={config.variant} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">{config.title}</div>
          <div className="text-sm">{config.description}</div>
        </div>
        {config.action && <div className="ml-4">{config.action}</div>}
      </AlertDescription>
    </Alert>
  )
}
