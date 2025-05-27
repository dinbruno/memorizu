"use client";

import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Edit3, Palette, Globe, ArrowRight, Sparkles, Heart, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Edit3 className="h-8 w-8" />,
      title: t("howItWorks.step1.title"),
      subtitle: t("howItWorks.step1.subtitle"),
      description: t("howItWorks.step1.description"),
      features: [t("howItWorks.step1.feature1"), t("howItWorks.step1.feature2"), t("howItWorks.step1.feature3")],
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 via-cyan-50 to-white",
      image: "/images/step-1-template.png",
      delay: 0,
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: t("howItWorks.step2.title"),
      subtitle: t("howItWorks.step2.subtitle"),
      description: t("howItWorks.step2.description"),
      features: [t("howItWorks.step2.feature1"), t("howItWorks.step2.feature2"), t("howItWorks.step2.feature3")],
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 via-pink-50 to-white",
      image: "/images/step-2-customize.png",
      delay: 0.2,
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t("howItWorks.step3.title"),
      subtitle: t("howItWorks.step3.subtitle"),
      description: t("howItWorks.step3.description"),
      features: [t("howItWorks.step3.feature1"), t("howItWorks.step3.feature2"), t("howItWorks.step3.feature3")],
      color: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 via-emerald-50 to-white",
      image: "/images/step-3-share.png",
      delay: 0.4,
    },
  ];

  const benefits = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: t("howItWorks.benefit1.title"),
      description: t("howItWorks.benefit1.description"),
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("howItWorks.benefit2.title"),
      description: t("howItWorks.benefit2.description"),
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t("howItWorks.benefit3.title"),
      description: t("howItWorks.benefit3.description"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-pink-500/10 to-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-primary font-medium">{t("howItWorks.badge")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t("howItWorks.title.part1")}
              </span>
              <br />
              <span className="text-foreground">{t("howItWorks.title.part2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">{t("howItWorks.subtitle")}</p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: step.delay }}
            >
              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg`}>
                    <div className="text-white">{step.icon}</div>
                    <div className="absolute -top-2 -right-2 bg-white text-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>{step.subtitle}</p>
                    <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>

                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: step.delay + 0.1 * featureIndex }}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {index === steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className={`bg-gradient-to-r ${step.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
                      >
                        {t("howItWorks.cta")}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Image/Visual */}
              <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <motion.div
                  className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${step.bgGradient}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Placeholder for step image */}
                  <div className="aspect-[4/3] flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <div className={`inline-flex p-6 rounded-full bg-gradient-to-r ${step.color} text-white shadow-lg`}>{step.icon}</div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">Visualização do Passo {index + 1}</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <motion.div
                    className="absolute top-4 left-4 bg-white/95 rounded-full px-3 py-1 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.delay + 0.3 }}
                  >
                    <span className="text-xs font-medium text-foreground">Passo {index + 1}</span>
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                </motion.div>

                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute -bottom-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.delay + 0.5 }}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <ArrowRight className="h-6 w-6 text-white rotate-90" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-12">
            {t("howItWorks.benefits.title")}{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{t("howItWorks.benefits.memorizu")}</span>?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">{benefit.icon}</div>
                <h4 className="font-semibold text-lg">{benefit.title}</h4>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
