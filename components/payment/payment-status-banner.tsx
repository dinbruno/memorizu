"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle } from "lucide-react";
import { PaymentSuccessBanner } from "./payment-success-banner";
import { useLanguage } from "@/components/language-provider";

interface PaymentStatusBannerProps {
  pageId: string;
  userId: string;
}

export function PaymentStatusBanner({ pageId, userId }: PaymentStatusBannerProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus) {
      setStatus(paymentStatus);
      // Clear the URL parameter after showing the message
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!status) return null;

  if (status === "success") {
    return <PaymentSuccessBanner userId={userId} pageId={pageId} />;
  }

  const getStatusConfig = () => {
    switch (status) {
      case "canceled":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          title: language === "pt-BR" ? "Pagamento Cancelado" : "Payment Canceled",
          description:
            language === "pt-BR"
              ? "Seu pagamento foi cancelado. Sua página não foi publicada."
              : "Your payment was canceled. Your page has not been published.",
          action: null,
        };
      case "failed":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          title: language === "pt-BR" ? "Falha no Pagamento" : "Payment Failed",
          description:
            language === "pt-BR"
              ? "Houve um problema ao processar seu pagamento. Por favor, tente novamente."
              : "There was an issue processing your payment. Please try again.",
          action: null,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

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
  );
}
