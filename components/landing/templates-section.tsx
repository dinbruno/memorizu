"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Gift, Cake, Crown, GraduationCap, TreePine, Play, Users, Calendar, Music, ImageIcon, MessageCircle } from "lucide-react";
import Link from "next/link";

export function TemplatesSection() {
  const { t } = useLanguage();

  const templates = [
    {
      title: t("templates.valentines.title"),
      icon: Heart,
      image: "/images/template-preview-valentines.png",
      gradient: "from-pink-500 to-rose-500",
      description: t("templates.valentines.description"),
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-pink-800">Nosso Amor Eterno</h3>
            <p className="text-sm text-pink-600">Uma jornada de amor e cumplicidade</p>

            {/* Galeria de fotos mockup */}
            <div className="grid grid-cols-2 gap-2 my-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-pink-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-pink-400" />
                </div>
              ))}
            </div>

            {/* Timeline mockup */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-pink-700">Primeiro encontro - Jan 2023</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-pink-700">Primeiro "eu te amo" - Mar 2023</span>
              </div>
            </div>

            {/* Music player mockup */}
            <div className="bg-white/80 rounded-lg p-2 flex items-center gap-2">
              <Play className="h-3 w-3 text-pink-500" />
              <div className="flex-1 text-xs text-pink-600">"Nossa música especial"</div>
              <Music className="h-3 w-3 text-pink-400" />
            </div>

            {/* Message mockup */}
            <div className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-pink-700 italic">"Você é a razão do meu sorriso todos os dias..."</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("templates.mothers.title"),
      icon: Gift,
      image: "/images/template-preview-mothers.png",
      gradient: "from-purple-500 to-violet-500",
      description: t("templates.mothers.description"),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-purple-800">Para a Melhor Mãe</h3>
            <p className="text-sm text-purple-600">Com todo meu amor e gratidão</p>

            {/* Hero image mockup */}
            <div className="aspect-video bg-purple-200 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                <span className="text-xs text-purple-500">Foto especial</span>
              </div>
            </div>

            {/* Memories grid */}
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-purple-200 rounded flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-purple-400" />
                </div>
              ))}
            </div>

            {/* Message card */}
            <div className="bg-white/90 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium text-purple-700">Mensagem especial</span>
              </div>
              <p className="text-xs text-purple-600">"Mãe, obrigado por todo amor, carinho e dedicação..."</p>
            </div>

            {/* Audio message mockup */}
            <div className="bg-white/80 rounded-lg p-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Play className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-1 bg-purple-200 rounded-full">
                  <div className="h-1 bg-purple-500 rounded-full w-1/3"></div>
                </div>
              </div>
              <span className="text-xs text-purple-600">2:30</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("templates.birthday.title"),
      icon: Cake,
      image: "/images/template-preview-birthday.png",
      gradient: "from-blue-500 to-cyan-500",
      description: t("templates.birthday.description"),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Cake className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-blue-800">Feliz Aniversário!</h3>
            <p className="text-sm text-blue-600">Celebrando mais um ano de vida</p>

            {/* Countdown timer mockup */}
            <div className="bg-white/90 rounded-lg p-3 mb-3">
              <div className="text-xs text-blue-600 mb-2">Contagem regressiva para o grande dia:</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "15", label: "Dias" },
                  { value: "08", label: "Horas" },
                  { value: "23", label: "Min" },
                  { value: "45", label: "Seg" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-blue-500 text-white rounded text-sm font-bold py-1">{item.value}</div>
                    <div className="text-xs text-blue-600 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo gallery mockup */}
            <div className="grid grid-cols-3 gap-1 mb-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-blue-200 rounded flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-blue-400" />
                </div>
              ))}
            </div>

            {/* Guest list mockup */}
            <div className="bg-white/80 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Lista de convidados</span>
              </div>
              <div className="space-y-1">
                {["Ana Silva", "João Santos", "Maria Costa"].map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("templates.wedding.title"),
      icon: Crown,
      image: "/images/template-preview-wedding.png",
      gradient: "from-emerald-500 to-teal-500",
      description: t("templates.wedding.description"),
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-emerald-800">Ana & João</h3>
            <p className="text-sm text-emerald-600">Convidam para seu casamento</p>

            {/* Main photo mockup */}
            <div className="aspect-video bg-emerald-200 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center">
                <Heart className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs text-emerald-500">Foto do casal</span>
              </div>
            </div>

            {/* Event details */}
            <div className="bg-white/90 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-700">15 de Junho, 2024</span>
              </div>
              <div className="text-xs text-emerald-600">Igreja São José - 16:00h</div>
              <div className="text-xs text-emerald-600">Recepção: Salão Elegance - 19:00h</div>
            </div>

            {/* RSVP mockup */}
            <div className="bg-white/80 rounded-lg p-2">
              <div className="text-xs font-medium text-emerald-700 mb-2">Confirme sua presença</div>
              <div className="space-y-1">
                <div className="h-4 bg-emerald-100 rounded text-xs flex items-center px-2 text-emerald-600">Nome completo</div>
                <div className="h-4 bg-emerald-100 rounded text-xs flex items-center px-2 text-emerald-600">Número de acompanhantes</div>
                <div className="h-3 bg-emerald-500 rounded text-xs flex items-center justify-center text-white">Confirmar</div>
              </div>
            </div>

            {/* Timeline mockup */}
            <div className="text-xs text-emerald-600">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Cerimônia religiosa</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Sessão de fotos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Recepção e festa</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("templates.graduation.title"),
      icon: GraduationCap,
      image: "/images/template-preview-graduation.png",
      gradient: "from-amber-500 to-orange-500",
      description: t("templates.graduation.description"),
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-amber-800">Minha Formatura</h3>
            <p className="text-sm text-amber-600">Engenharia de Software - 2024</p>

            {/* Achievement photo */}
            <div className="aspect-video bg-amber-200 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center">
                <GraduationCap className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                <span className="text-xs text-amber-500">Foto da formatura</span>
              </div>
            </div>

            {/* Academic journey timeline */}
            <div className="bg-white/90 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-amber-700 mb-2">Jornada Acadêmica</div>
              <div className="space-y-1 text-xs text-amber-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>2020 - Início do curso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>2022 - Estágio na TechCorp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>2024 - Formatura com honras</span>
                </div>
              </div>
            </div>

            {/* Stats mockup */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/80 rounded p-2 text-center">
                <div className="text-sm font-bold text-amber-700">4</div>
                <div className="text-xs text-amber-600">Anos</div>
              </div>
              <div className="bg-white/80 rounded p-2 text-center">
                <div className="text-sm font-bold text-amber-700">9.2</div>
                <div className="text-xs text-amber-600">Média</div>
              </div>
              <div className="bg-white/80 rounded p-2 text-center">
                <div className="text-sm font-bold text-amber-700">1º</div>
                <div className="text-xs text-amber-600">Lugar</div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-amber-700 italic">"Após anos de dedicação, finalmente alcancei meu objetivo..."</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("templates.christmas.title"),
      icon: TreePine,
      image: "/images/template-preview-christmas.png",
      gradient: "from-red-500 to-green-500",
      description: t("templates.christmas.description"),
      color: "text-red-600",
      bgColor: "bg-red-50",
      mockup: (
        <div className="w-full h-full bg-gradient-to-br from-red-50 to-green-100 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                <TreePine className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-red-800">Feliz Natal!</h3>
            <p className="text-sm text-green-600">Família Silva deseja boas festas</p>

            {/* Christmas tree mockup */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-16 h-16 bg-green-200 rounded-lg flex items-center justify-center">
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">⭐</span>
                </div>
              </div>
            </div>

            {/* Family photos grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-red-200 rounded flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-red-400" />
                </div>
              ))}
            </div>

            {/* Christmas message */}
            <div className="bg-white/90 rounded-lg p-3">
              <div className="text-xs font-medium text-red-700 mb-2">Mensagem Natalina</div>
              <p className="text-xs text-green-600">"Que este Natal traga paz, amor e alegria para todos..."</p>
            </div>

            {/* Christmas music player */}
            <div className="bg-white/80 rounded-lg p-2 flex items-center gap-2">
              <Play className="h-3 w-3 text-red-500" />
              <div className="flex-1 text-xs text-green-600">"Jingle Bells"</div>
              <Music className="h-3 w-3 text-red-400" />
            </div>

            {/* Countdown to Christmas */}
            <div className="bg-gradient-to-r from-red-100 to-green-100 rounded-lg p-2">
              <div className="text-xs text-red-700 mb-1">Faltam para o Natal:</div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { value: "25", label: "D" },
                  { value: "12", label: "H" },
                  { value: "30", label: "M" },
                  { value: "15", label: "S" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-red-500 text-white rounded text-xs font-bold py-0.5">{item.value}</div>
                    <div className="text-xs text-green-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="templates" className="py-24 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("templates.badge")}</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("templates.title")}
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-[600px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("templates.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => {
            const IconComponent = template.icon;
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                  {/* Template Preview */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {/* Real template mockup */}
                    <div className="absolute inset-0 p-4">{template.mockup}</div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Template badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-lg`}>
                        <IconComponent className={`h-3 w-3 ${template.color}`} />
                        <span className="text-xs font-medium text-foreground">{template.title}</span>
                      </div>
                    </div>

                    {/* Preview button */}
                    <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        <Play className="h-3 w-3 mr-1" />
                        {t("templates.preview")}
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${template.gradient}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{template.title}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: ImageIcon, label: t("templates.features.gallery") },
                        { icon: Music, label: t("templates.features.audio") },
                        { icon: MessageCircle, label: t("templates.features.messages") },
                        { icon: Calendar, label: t("templates.features.events") },
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full">
                          <feature.icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{feature.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${template.gradient} hover:opacity-90 text-white transition-all duration-300`}
                      asChild
                    >
                      <Link href="/signup">{t("templates.useTemplate")}</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{t("templates.cta.title")}</h3>
            <p className="text-muted-foreground">{t("templates.cta.description")}</p>
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white" asChild>
              <Link href="/signup">{t("templates.cta.button")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
