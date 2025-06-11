"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, CreditCard, Shield, Zap, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getStripe, isStripeConfigured } from "@/lib/stripe/stripe-client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLanguage();

  // Verificar configuração do Stripe
  useEffect(() => {
    if (!isStripeConfigured()) {
      setStripeConfigError(
        "O sistema de pagamento não está configurado corretamente. Por favor, entre em contato com o suporte se o problema persistir."
      );
    }
  }, []);

  // Buscar preço do servidor quando o diálogo abrir
  useEffect(() => {
    if (open) {
      fetchPricing();
    }
  }, [open]);

  // Verificar sucesso do pagamento ao carregar a página
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success") {
      // Pagamento foi bem-sucedido, chamar o callback
      onPaymentSuccess?.();
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      onOpenChange(false);
    }
  }, [onPaymentSuccess, onOpenChange]);

  const fetchPricing = async () => {
    try {
      setLoadingPricing(true);
      // Definir preço fixo em R$21,90
      setPricingConfig({
        price: 21.9,
        currency: "BRL",
        description: "Taxa única de publicação",
      });
    } catch (error) {
      console.error("Erro ao buscar preço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar informações de preço",
      });
    } finally {
      setLoadingPricing(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setStripeConfigError(null);
      setError(null);

      const response = await fetch("/api/stripe/publish-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("payment.error"));
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Falha ao carregar o Stripe");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error("Erro no pagamento:", err);
      setStripeConfigError(t("payment.error"));
      setError(t("payment.error"));
      toast({
        variant: "destructive",
        title: "Erro no Pagamento",
        description: err instanceof Error ? err.message : t("payment.error"),
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
            {t("payment.title")}
          </DialogTitle>
          <DialogDescription>{t("payment.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Erro de Configuração do Stripe */}
          {stripeConfigError && (
            <div className="rounded-lg border-destructive border p-4 bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <h4 className="font-medium text-destructive">{t("payment.errorTitle")}</h4>
              </div>
              <p className="text-sm text-destructive">{stripeConfigError}</p>
            </div>
          )}

          {/* Informações da Página */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">{t("payment.pageDetails")}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Título:</strong> {pageTitle || "Página Sem Título"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>URL:</strong> memorizu.com/p/{pageId}
            </p>
          </div>

          {/* Preço */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{t("payment.price")}</span>
              <div className="text-right">
                {loadingPricing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t("payment.loading")}</span>
                  </div>
                ) : pricingConfig ? (
                  <>
                    <div className="text-2xl font-bold">R$ {pricingConfig.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{t("payment.oneTime")}</div>
                  </>
                ) : (
                  <div className="text-sm text-destructive">{t("payment.errorLoadingPrice")}</div>
                )}
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("payment.benefit1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("payment.benefit2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("payment.benefit3")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("payment.benefit4")}</span>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("payment.acceptedMethods")}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Visa</Badge>
              <Badge variant="outline">Mastercard</Badge>
              <Badge variant="outline">American Express</Badge>
              <Badge variant="outline">Apple Pay</Badge>
              <Badge variant="outline">Google Pay</Badge>
            </div>
          </div>

          {/* Aviso de Segurança */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">{t("payment.securePayment")}</p>
              <p className="text-blue-700 dark:text-blue-300">
                Seu pagamento é processado com segurança pelo Stripe. Nunca armazenamos os dados do seu cartão.
              </p>
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
                {t("payment.processing")}
              </>
            ) : loadingPricing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("payment.loading")}
              </>
            ) : pricingConfig ? (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {t("payment.payNow")}
              </>
            ) : (
              t("payment.errorLoadingPrice")
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            {t("payment.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
