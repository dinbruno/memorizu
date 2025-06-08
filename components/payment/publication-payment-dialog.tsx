"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Shield, Zap, Globe, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { getStripe, isStripeConfigured } from "@/lib/stripe/stripe-client";

interface PublicationPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pageTitle: string;
  userId: string;
  onPaymentSuccess?: () => void;
}

interface PricingConfig {
  price: number;
  currency: string;
  description: string;
}

export function PublicationPaymentDialog({ open, onOpenChange, pageId, pageTitle, userId, onPaymentSuccess }: PublicationPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [stripeConfigError, setStripeConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Verificar configuração do Stripe
  useEffect(() => {
    if (!isStripeConfigured()) {
      setStripeConfigError("Payment system is not properly configured. Please contact support if this issue persists.");
    }
  }, []);

  // Fetch pricing from server when dialog opens
  useEffect(() => {
    if (open) {
      fetchPricing();
    }
  }, [open]);

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success") {
      // Payment was successful, call the callback
      onPaymentSuccess?.();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      onOpenChange(false);
    }
  }, [onPaymentSuccess, onOpenChange]);

  const fetchPricing = async () => {
    try {
      setLoadingPricing(true);
      const response = await fetch("/api/publication/pricing");
      const data = await response.json();

      if (response.ok) {
        setPricingConfig(data);
      } else {
        throw new Error(data.error || "Failed to fetch pricing");
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pricing information",
      });
    } finally {
      setLoadingPricing(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session");
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Publish Your Page
          </DialogTitle>
          <DialogDescription>Make your page accessible to the world with a one-time publication fee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stripe Configuration Error */}
          {stripeConfigError && (
            <div className="rounded-lg border-destructive border p-4 bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h4 className="font-medium text-destructive">Configuration Error</h4>
              </div>
              <p className="text-sm text-destructive">{stripeConfigError}</p>
            </div>
          )}

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
                {loadingPricing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : pricingConfig ? (
                  <>
                    <div className="text-2xl font-bold">${pricingConfig.price}</div>
                    <div className="text-xs text-muted-foreground">One-time payment</div>
                  </>
                ) : (
                  <div className="text-sm text-destructive">Failed to load pricing</div>
                )}
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
              <p className="text-blue-700 dark:text-blue-300">Your payment is processed securely by Stripe. We never store your card details.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handlePayment}
            disabled={isLoading || loadingPricing || !pricingConfig || !!stripeConfigError}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : loadingPricing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : pricingConfig ? (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Pay ${pricingConfig.price} & Publish
              </>
            ) : (
              "Unable to load pricing"
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
