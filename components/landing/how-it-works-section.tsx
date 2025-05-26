"use client"

import { useLanguage } from "@/components/language-provider"
import { motion } from "framer-motion"
import { Edit3, Palette, Globe } from "lucide-react"

export function HowItWorksSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: <Edit3 className="h-8 w-8" />,
      title: t("features.create.title"),
      description: t("features.create.description"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: t("features.customize.title"),
      description: t("features.customize.description"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t("features.publish.title"),
      description: t("features.publish.description"),
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("features.subtitle")}</p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="relative mb-6">
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${step.color} mb-4`}>
                  <div className="text-white">{step.icon}</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
