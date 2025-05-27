"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function SimplePricingSection() {
  const { t } = useLanguage();

  const features = [
    t("pricing.publication.feature1"),
    t("pricing.publication.feature2"),
    t("pricing.publication.feature3"),
    t("pricing.publication.feature4"),
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricing.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("pricing.subtitle")}</p>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-primary shadow-lg relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                  {t("pricing.publication.title")}
                </span>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{t("pricing.publication.title")}</CardTitle>
                <div className="flex items-baseline justify-center mt-4">
                  <span className="text-4xl font-bold">{t("pricing.publication.price")}</span>
                </div>
                <CardDescription className="mt-2">{t("pricing.publication.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/signup">{t("pricing.publication.cta")}</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
