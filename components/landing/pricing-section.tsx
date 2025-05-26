"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function PricingSection() {
  const { t } = useLanguage();

  const plans = [
    {
      title: t("pricing.free.title"),
      price: t("pricing.free.price"),
      description: t("pricing.free.description"),
      features: [t("pricing.free.feature1"), t("pricing.free.feature2"), t("pricing.free.feature3"), t("pricing.free.feature4")],
      cta: t("pricing.free.cta"),
      popular: false,
    },
    {
      title: t("pricing.pro.title"),
      price: t("pricing.pro.price"),
      description: t("pricing.pro.description"),
      features: [t("pricing.pro.feature1"), t("pricing.pro.feature2"), t("pricing.pro.feature3"), t("pricing.pro.feature4")],
      cta: t("pricing.pro.cta"),
      popular: true,
    },
    {
      title: t("pricing.premium.title"),
      price: t("pricing.premium.price"),
      description: t("pricing.premium.description"),
      features: [t("pricing.premium.feature1"), t("pricing.premium.feature2"), t("pricing.premium.feature3"), t("pricing.premium.feature4")],
      cta: t("pricing.premium.cta"),
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("pricing.title")}
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-[600px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("pricing.subtitle")}
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="flex"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className={`w-full ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
