import { loadStripe } from "@stripe/stripe-js";

// Função para obter a chave pública do Stripe com verificação de segurança
function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment variables");
    throw new Error("Stripe configuration error: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. " + "Please check your environment variables.");
  }

  if (!key.startsWith("pk_")) {
    console.error("Invalid Stripe publishable key format:", key.substring(0, 10) + "...");
    throw new Error("Stripe configuration error: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with 'pk_'");
  }

  return key;
}

// Inicializar Stripe com tratamento de erro
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    try {
      const publishableKey = getStripePublishableKey();
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      // Retorna uma Promise rejeitada para manter a interface consistente
      stripePromise = Promise.reject(error);
    }
  }
  return stripePromise;
};

// Exportar função para verificar se o Stripe está configurado
export const isStripeConfigured = (): boolean => {
  try {
    getStripePublishableKey();
    return true;
  } catch {
    return false;
  }
};
