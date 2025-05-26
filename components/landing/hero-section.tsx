"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, ArrowRight, Sparkles, Users, Zap, Heart, Star } from "lucide-react";

const templates = [
  "/valentines-couple.png",
  "/placeholder.svg?height=600&width=800&query=elegant wedding invitation with golden details and flowers",
  "/placeholder.svg?height=600&width=800&query=birthday celebration page with balloons and confetti animation",
];

const floatingElements = [
  { icon: Heart, color: "text-pink-500", delay: 0 },
  { icon: Star, color: "text-yellow-500", delay: 1 },
  { icon: Sparkles, color: "text-purple-500", delay: 2 },
];

export function HeroSection() {
  const { t } = useLanguage();
  const [currentTemplate, setCurrentTemplate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemplate((prev) => (prev + 1) % templates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 min-h-[90vh] flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Floating Icons */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`absolute ${element.color}`}
            style={{
              top: `${20 + index * 25}%`,
              left: `${10 + index * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: element.delay,
            }}
          >
            <element.icon className="h-6 w-6 opacity-20" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        {/* Trust Badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="px-6 py-3 text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-4 w-4 mr-2" />
            {t("hero.badge")}
          </Badge>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl">
            <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                {t("hero.title.part1")}{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                  {t("hero.title.part2")}
                </span>{" "}
                {t("hero.title.part3")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">{t("hero.subtitle")}</p>
            </motion.div>

            {/* Value Propositions */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">2 min</div>
                  <div className="text-sm text-muted-foreground">Setup Time</div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">10,000+</div>
                  <div className="text-sm text-muted-foreground">Happy Users</div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">4.9/5</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                asChild
              >
                <Link href="/signup">
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 group border-2" asChild>
                <Link href="#how-it-works">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {t("hero.secondary")}
                </Link>
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-4 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-white font-bold text-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">Join thousands</span> of creators worldwide
              </div>
            </motion.div>
          </div>

          {/* Right Content - Interactive Preview */}
          <motion.div
            className="flex-1 relative max-w-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              {/* Main Preview */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
                {templates.map((template, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{
                      opacity: index === currentTemplate ? 1 : 0,
                      scale: index === currentTemplate ? 1 : 1.1,
                    }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  >
                    <img src={template || "/placeholder.svg"} alt="Template preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                ))}

                {/* Live Indicator */}
                <motion.div
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Live Preview</span>
                  </div>
                </motion.div>
              </div>

              {/* Template Indicators */}
              <div className="flex justify-center mt-6 gap-3">
                {templates.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTemplate ? "bg-primary scale-125 shadow-lg" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    onClick={() => setCurrentTemplate(index)}
                  />
                ))}
              </div>

              {/* Floating Feature Cards */}
              <motion.div
                className="absolute -left-6 top-1/4 bg-white/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl max-w-[200px] hidden lg:block"
                animate={{ x: [0, 10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">Drag & Drop</span>
                </div>
                <p className="text-xs text-muted-foreground">Build pages in minutes with our intuitive editor</p>
              </motion.div>

              <motion.div
                className="absolute -right-6 bottom-1/4 bg-white/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl max-w-[200px] hidden lg:block"
                animate={{ x: [0, -10, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-secondary" />
                  </div>
                  <span className="font-semibold text-sm">Magic Effects</span>
                </div>
                <p className="text-xs text-muted-foreground">Add stunning animations and interactive elements</p>
              </motion.div>

              {/* Background Glow */}
              <div className="absolute -inset-20 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Features */}
        <motion.div
          className="text-center mt-20 pt-8 border-t border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground mb-6 text-lg">
            ✨ <strong>{t("hero.free_create")}</strong> • 💳 <strong>{t("hero.pay_publish")}</strong> • 🚀 <strong>{t("hero.live_minutes")}</strong>
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {t("hero.no_credit_card")}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              {t("hero.mobile_responsive")}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              {t("hero.share_anywhere")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
