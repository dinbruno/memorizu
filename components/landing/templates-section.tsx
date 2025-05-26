"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import { motion } from "framer-motion";
import { Heart, Gift, Cake, Crown, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";

export function TemplatesSection() {
  const { t } = useLanguage();

  const templates = [
    {
      title: t("templates.valentines"),
      icon: Heart,
      image: "/placeholder.svg?height=200&width=300&query=romantic valentine's day template with hearts and roses",
      gradient: "from-pink-500 to-red-500",
      description: "Páginas românticas para o Dia dos Namorados",
      color: "text-pink-600",
    },
    {
      title: t("templates.mothers"),
      icon: Gift,
      image: "/placeholder.svg?height=200&width=300&query=mother's day template with flowers and warm colors",
      gradient: "from-purple-500 to-pink-500",
      description: "Homenagens especiais para o Dia das Mães",
      color: "text-purple-600",
    },
    {
      title: t("templates.birthday"),
      icon: Cake,
      image: "/placeholder.svg?height=200&width=300&query=birthday celebration template with confetti and balloons",
      gradient: "from-yellow-500 to-orange-500",
      description: "Celebrações de aniversário inesquecíveis",
      color: "text-yellow-600",
    },
    {
      title: t("templates.wedding"),
      icon: Crown,
      image: "/placeholder.svg?height=200&width=300&query=elegant wedding template with rings and flowers",
      gradient: "from-blue-500 to-purple-500",
      description: "Casamentos elegantes e memoráveis",
      color: "text-blue-600",
    },
    {
      title: t("templates.graduation"),
      icon: GraduationCap,
      image: "/placeholder.svg?height=200&width=300&query=graduation celebration template with cap and diploma",
      gradient: "from-green-500 to-blue-500",
      description: "Formaturas e conquistas acadêmicas",
      color: "text-green-600",
    },
  ];

  return (
    <section id="templates" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Templates Profissionais</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("builder.templates")}
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-[600px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("features.templates.description")}
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground/80 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            💡 Dica: Arraste os cards para explorar!
          </motion.p>
        </div>

        <DraggableCardContainer className="flex flex-wrap justify-center gap-8 min-h-[600px]">
          {templates.map((template, index) => {
            const IconComponent = template.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <DraggableCardBody className="w-80 min-h-96 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-white/20 shadow-xl">
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${template.gradient}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                  </div>

                  {/* Template Preview */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} />
                    <img
                      src={template.image || "/placeholder.svg"}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white">
                        <IconComponent className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Visualizar Template</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{template.description}</p>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full border-2 hover:bg-gradient-to-r ${template.gradient} hover:text-white hover:border-transparent transition-all duration-300`}
                      asChild
                    >
                      <Link href="/signup">{t("hero.cta")}</Link>
                    </Button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <IconComponent className={`w-12 h-12 ${template.color}`} />
                  </div>
                </DraggableCardBody>
              </motion.div>
            );
          })}
        </DraggableCardContainer>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
            asChild
          >
            <Link href="/signup">Começar a Criar Agora</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
