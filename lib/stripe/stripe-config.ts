import Stripe from "stripe";

if (!process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY) {
  console.log(`${process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY}`);
  throw new Error(`${process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY}`);
}

export const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY, {
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
