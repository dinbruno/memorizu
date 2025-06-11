"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language-provider";
import { PaymentSuccessBanner } from "./payment-success-banner";

interface PaymentRecoveryProps {
  userId: string;
  pageId: string;
  pageStatus: {
    published: boolean;
    paymentStatus?: string;
    paymentIntentId?: string;
  };
  onRecoverySuccess?: () => void;
}

export function PaymentRecovery({ userId, pageId, pageStatus, onRecoverySuccess }: PaymentRecoveryProps) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Check if recovery is needed
  useEffect(() => {
    // Show recovery only if:
    // 1. Page is not published
    // 2. Has a payment intent ID (indicating a payment was made)
    // 3. Payment status is not "paid"
    // 4. Recovery hasn't been attempted yet
    const needsRecovery = Boolean(!pageStatus.published && pageStatus.paymentIntentId && pageStatus.paymentStatus !== "paid" && !recoveryAttempted);

    setShowRecovery(needsRecovery);
  }, [pageStatus, recoveryAttempted]);

  const handleRecovery = async () => {
    setIsRecovering(true);
    setRecoveryAttempted(true);

    try {
      const response = await fetch("/api/payment/verify-and-publish", {
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

      if (response.ok && data.success) {
        toast({
          title: language === "pt-BR" ? "Pagamento Recuperado!" : "Payment Recovered!",
          description:
            language === "pt-BR"
              ? "Sua página foi publicada com sucesso. O pagamento foi verificado e processado."
              : "Your page has been published successfully. Payment was verified and processed.",
        });

        // Call the success callback
        onRecoverySuccess?.();

        // Force a page reload to ensure all components are updated
        window.location.reload();
      } else if (response.status === 404) {
        // No payment found - this is normal, hide recovery
        setShowRecovery(false);
      } else {
        throw new Error(data.error || "Recovery failed");
      }
    } catch (error) {
      console.error("Recovery error:", error);
      toast({
        variant: "destructive",
        title: language === "pt-BR" ? "Erro na Recuperação" : "Recovery Error",
        description:
          language === "pt-BR"
            ? "Não foi possível verificar o pagamento. Se você acabou de pagar, tente novamente em alguns minutos."
            : "Could not verify payment. If you just paid, please try again in a few minutes.",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  if (!showRecovery) {
    return null;
  }

  return <PaymentSuccessBanner userId={userId} pageId={pageId} needsRecovery={true} onRecoveryClick={handleRecovery} />;
}
