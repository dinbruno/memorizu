"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Heart, Star } from "lucide-react";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("cta.badge")}</span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t("cta.title.part1")}
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">{t("cta.title.part2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("cta.subtitle")}</p>
          </motion.div>

          {/* Stats */}
          {/* <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { icon: Users, value: "10,000+", label: t("cta.stats.users") },
              { icon: Heart, value: "50,000+", label: t("cta.stats.pages") },
              { icon: Star, value: "4.9/5", label: t("cta.stats.rating") },
              { icon: Sparkles, value: "99%", label: t("cta.stats.satisfaction") },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div> */}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/signup">
              <Button size="lg" className="memorizu-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                {t("cta.button.primary")}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#templates">
              <Button size="lg" variant="outline" className="border-2">
                {t("cta.button.secondary")}
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          {/* <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{t("cta.trust.free")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>{t("cta.trust.noCard")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>{t("cta.trust.fast")}</span>
            </div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
