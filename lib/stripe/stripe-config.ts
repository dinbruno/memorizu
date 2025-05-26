import Stripe from "stripe";

let stripeKey = "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";

if (!stripeKey) {
  console.log(`${process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY}`);
  throw new Error(`${process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY}`);
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  plans: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID!,
      name: "Pro",
      price: 9.99,
      interval: "month",
      features: ["Unlimited pages", "Premium templates", "Advanced components", "Priority support", "Remove branding", "Custom domain", "Analytics"],
    },
    business: {
      priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
      name: "Business",
      price: 29.99,
      interval: "month",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Advanced analytics",
        "API access",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
      ],
    },
  },
};
