"use client"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card"
import { motion } from "framer-motion"
import { Heart, Gift, Cake, Crown, GraduationCap, Sparkles } from "lucide-react"
import Link from "next/link"

export function TemplatesSection() {
  const { t } = useLanguage()

  const templates = [
    {
      title: t("templates.valentines"),
      icon: Heart,
      image: "/placeholder.svg?height=200&width=300&query=romantic valentine's day template with hearts and roses",
      gradient: "from-pink-500 to-red-500",
      description: "Páginas românticas para o Dia dos Namorados",
      color: "text-pink-600",
      position: { x: -30, y: -20, rotate: -12 },
    },
    {
      title: t("templates.mothers"),
      icon: Gift,
      image: "/placeholder.svg?height=200&width=300&query=mother's day template with flowers and warm colors",
      gradient: "from-purple-500 to-pink-500",
      description: "Homenagens especiais para o Dia das Mães",
      color: "text-purple-600",
      position: { x: 40, y: -60, rotate: 8 },
    },
    {
      title: t("templates.birthday"),
      icon: Cake,
      image: "/placeholder.svg?height=200&width=300&query=birthday celebration template with confetti and balloons",
      gradient: "from-yellow-500 to-orange-500",
      description: "Celebrações de aniversário inesquecíveis",
      color: "text-yellow-600",
      position: { x: -60, y: 40, rotate: 15 },
    },
    {
      title: t("templates.wedding"),
      icon: Crown,
      image: "/placeholder.svg?height=200&width=300&query=elegant wedding template with rings and flowers",
      gradient: "from-blue-500 to-purple-500",
      description: "Casamentos elegantes e memoráveis",
      color: "text-blue-600",
      position: { x: 80, y: 20, rotate: -6 },
    },
    {
      title: t("templates.graduation"),
      icon: GraduationCap,
      image: "/placeholder.svg?height=200&width=300&query=graduation celebration template with cap and diploma",
      gradient: "from-green-500 to-blue-500",
      description: "Formaturas e conquistas acadêmicas",
      color: "text-green-600",
      position: { x: 20, y: 70, rotate: -18 },
    },
  ]

  return (
    <section id="templates" className="py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-yellow-300/15 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center space-y-3 mb-4">
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
            className="text-lg text-muted-foreground max-w-[500px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("features.templates.description")}
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="animate-bounce">👆</span>
            <span>Arraste os cards para explorar!</span>
          </motion.div>
        </div>

        <DraggableCardContainer className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative w-full max-w-7xl mx-auto">
            {templates.map((template, index) => {
              const IconComponent = template.icon
              return (
                <motion.div
                  key={index}
                  className="absolute"
                  initial={{
                    opacity: 0,
                    scale: 0.7,
                    x: template.position.x,
                    y: template.position.y,
                    rotate: template.position.rotate,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: template.position.x,
                    y: template.position.y,
                    rotate: template.position.rotate,
                  }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15 * index,
                    type: "spring",
                    stiffness: 120,
                    damping: 12,
                  }}
                  style={{
                    left: `${15 + (index % 3) * 25}%`,
                    top: `${-5 + Math.floor(index / 3) * 35}%`,
                    zIndex: templates.length - index,
                  }}
                >
                  <DraggableCardBody className="w-72 min-h-[380px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                    {/* Header with Icon */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${template.gradient} shadow-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{template.title}</h3>
                    </div>

                    {/* Template Preview */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3 group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-15`} />
                      <img
                        src={template.image || "/placeholder.svg"}
                        alt={template.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300" />

                      {/* Floating Badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/90 rounded-full text-xs font-medium backdrop-blur-sm">
                        Template
                      </div>

                      {/* Overlay Content */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <div className={`p-3 rounded-full bg-gradient-to-r ${template.gradient} mb-2 mx-auto w-fit`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold">Usar Template</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full border-2 hover:bg-gradient-to-r ${template.gradient} hover:text-white hover:border-transparent transition-all duration-300 font-medium`}
                        asChild
                      >
                        <Link href="/signup">{t("hero.cta")}</Link>
                      </Button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-3 right-3 opacity-10">
                      <IconComponent className={`w-16 h-16 ${template.color}`} />
                    </div>

                    {/* Subtle glow effect */}
                    <div
                      className={`absolute inset-0 rounded-md bg-gradient-to-r ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                    />
                  </DraggableCardBody>
                </motion.div>
              )
            })}
          </div>
        </DraggableCardContainer>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
            asChild
          >
            <Link href="/signup">Começar a Criar Agora</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
