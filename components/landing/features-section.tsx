"use client";

import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Edit3, Palette, Globe, Sparkles, Users, Shield } from "lucide-react";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Edit3 className="h-6 w-6" />,
      title: t("features.create.title"),
      description: t("features.create.description"),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: t("features.customize.title"),
      description: t("features.customize.description"),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Magic Effects",
      description: "Add falling hearts, confetti, sparkles and more interactive animations",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t("features.publish.title"),
      description: t("features.publish.description"),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Share & Invite",
      description: "Share your pages with friends and family via custom URLs",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Your pages are hosted securely with 99.9% uptime guarantee",
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("features.subtitle")}</p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-full">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
