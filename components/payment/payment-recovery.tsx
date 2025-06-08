"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language-provider";

interface PaymentRecoveryProps {
  userId: string;
  pageId: string;
  pageStatus: {
    published: boolean;
    paymentStatus?: string;
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
    // Show recovery if page is not published but might have been paid
    // This happens when webhook fails but payment succeeded
    const needsRecovery = !pageStatus.published && pageStatus.paymentStatus !== "paid" && !recoveryAttempted;

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

        onRecoverySuccess?.();
        setShowRecovery(false);
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

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5" />
          {language === "pt-BR" ? "Verificação de Pagamento" : "Payment Verification"}
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {language === "pt-BR"
            ? "Se você acabou de fazer um pagamento, podemos verificar e ativar sua página automaticamente."
            : "If you just made a payment, we can verify and activate your page automatically."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {language === "pt-BR"
              ? "Detectamos que sua página pode não ter sido publicada automaticamente após o pagamento. Clique no botão abaixo para verificar e corrigir isso."
              : "We detected that your page may not have been published automatically after payment. Click the button below to verify and fix this."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={handleRecovery} disabled={isRecovering} className="flex-1">
            {isRecovering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "pt-BR" ? "Verificando..." : "Verifying..."}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === "pt-BR" ? "Verificar Pagamento" : "Verify Payment"}
              </>
            )}
          </Button>

          <Button variant="outline" onClick={() => setShowRecovery(false)} disabled={isRecovering}>
            {language === "pt-BR" ? "Dispensar" : "Dismiss"}
          </Button>
        </div>

        <div className="text-xs text-amber-700 dark:text-amber-300">
          {language === "pt-BR"
            ? "💡 Esta verificação é segura e não cobrará novamente. Apenas verifica se existe um pagamento válido."
            : "💡 This verification is safe and won't charge again. It only checks if a valid payment exists."}
        </div>
      </CardContent>
    </Card>
  );
}
