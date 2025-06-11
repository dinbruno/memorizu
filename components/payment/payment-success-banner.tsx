"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import confetti from "canvas-confetti";

interface PaymentSuccessBannerProps {
  pageId: string;
  userId: string;
  onRecoveryClick?: () => void;
  needsRecovery?: boolean;
}

export function PaymentSuccessBanner({ pageId, userId, onRecoveryClick, needsRecovery }: PaymentSuccessBannerProps) {
  const { language } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      // Trigger confetti effect
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Stop confetti after duration
      setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => {
        clearInterval(interval);
      };
    }
  }, [showConfetti]);

  return (
    <Alert
      className={`mb-4 ${
        needsRecovery
          ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
          : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
      }`}
    >
      <CheckCircle className={`h-4 w-4 ${needsRecovery ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className={`font-medium ${needsRecovery ? "text-orange-900 dark:text-orange-100" : "text-green-900 dark:text-green-100"}`}>
            {language === "pt-BR"
              ? needsRecovery
                ? "Pagamento Recebido!"
                : "Pagamento Confirmado!"
              : needsRecovery
              ? "Payment Received!"
              : "Payment Confirmed!"}
          </div>
          <div className={`text-sm ${needsRecovery ? "text-orange-700 dark:text-orange-300" : "text-green-700 dark:text-green-300"}`}>
            {language === "pt-BR"
              ? needsRecovery
                ? "Seu pagamento foi recebido, mas precisamos confirmar a publicação. Clique no botão para verificar."
                : "Sua página está publicada e disponível em:"
              : needsRecovery
              ? "Your payment was received, but we need to confirm the publication. Click the button to verify."
              : "Your page is published and available at:"}
          </div>
        </div>
        <div>
          {needsRecovery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecoveryClick}
              className="border-orange-200 bg-orange-100 text-orange-900 hover:bg-orange-200 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-100 dark:hover:bg-orange-800"
            >
              {language === "pt-BR" ? "Verificar Agora" : "Verify Now"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href={`/p/${userId}/${pageId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === "pt-BR" ? "Ver Página" : "View Page"}
              </a>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
