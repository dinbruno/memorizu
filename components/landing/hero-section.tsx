"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Gift, Cake, GraduationCap, TreePine } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import Image from "next/image";

export function HeroSection() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides com temas dinâmicos usando traduções
  const heroSlides = [
    {
      id: 1,
      titleKey: "hero.valentines.title",
      headlineKey: "hero.valentines.headline",
      descriptionKey: "hero.valentines.description",
      image: "/hero/T1.png",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 via-rose-50 to-white",
      accentColor: "pink",
    },
    {
      id: 2,
      titleKey: "hero.mothers.title",
      headlineKey: "hero.mothers.headline",
      descriptionKey: "hero.mothers.description",
      image: "/hero/T3.png",
      icon: Gift,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 via-violet-50 to-white",
      accentColor: "purple",
    },
    {
      id: 3,
      titleKey: "hero.birthday.title",
      headlineKey: "hero.birthday.headline",
      descriptionKey: "hero.birthday.description",
      image: "/hero/T2.png",
      icon: Cake,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 via-cyan-50 to-white",
      accentColor: "blue",
    },
    {
      id: 4,
      titleKey: "hero.wedding.title",
      headlineKey: "hero.wedding.headline",
      descriptionKey: "hero.wedding.description",
      image: "/hero/T5.png",
      icon: Heart,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 via-teal-50 to-white",
      accentColor: "emerald",
    },
    {
      id: 5,
      titleKey: "hero.graduation.title",
      headlineKey: "hero.graduation.headline",
      descriptionKey: "hero.graduation.description",
      image: "/hero/T6.png",
      icon: GraduationCap,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 via-orange-50 to-white",
      accentColor: "amber",
    },
  ];

  // Autoplay para o carrossel - sempre ativo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentTheme = heroSlides[currentSlide];
  const IconComponent = currentTheme.icon;

  // Preload first image for better performance
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroSlides[0].image;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section
      className={` relative w-full min-h-screen flex items-center overflow-hidden bg-gradient-to-br ${currentTheme.bgGradient} transition-all duration-1000 ease-in-out`}
    >
      {/* Textura de fundo */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-1/4 left-10 w-32 h-32 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-10 blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-10 blur-3xl`}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className={`absolute top-1/2 right-10 w-24 h-24 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-15 blur-2xl`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="container px-4 md:px-6 z-10 relative max-w-7xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Conteúdo textual */}
          <motion.div
            className="flex flex-col justify-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge do tema atual */}
            <motion.div
              className="flex items-center gap-2 w-fit"
              key={`badge-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`p-2 rounded-full bg-gradient-to-r ${currentTheme.gradient} text-white`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <span className={`text-sm font-medium bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}>
                {t(currentTheme.titleKey)}
              </span>
            </motion.div>

            {/* Título principal */}
            <div className="space-y-4">
              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl"
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className={`bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}>{t(currentTheme.headlineKey)}</span>
                <br />
                <span className="text-foreground dark:text-black">{t("hero.mainTitle")}</span>
              </motion.h1>

              <motion.p
                className="max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed"
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {t(currentTheme.descriptionKey)}
              </motion.p>
            </div>

            {/* Botões de ação */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${currentTheme.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {t("hero.cta.primary")}
                </Button>
              </Link>
              <Link href="#templates">
                <Button size="lg" variant="outline" className="border-2 hover:bg-muted/50">
                  {t("hero.cta.secondary")} {t(currentTheme.titleKey)}
                </Button>
              </Link>
            </motion.div>

            {/* Controles do carrossel */}
            <motion.div
              className="flex items-center gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="rounded-full h-12 w-12 bg-white/90 shadow-lg hover:shadow-xl border border-border/20 dark:bg-black/90"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? `bg-gradient-to-r ${currentTheme.gradient} opacity-100`
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="rounded-full h-12 w-12 bg-white/90 shadow-lg hover:shadow-xl border border-border/20 dark:bg-black/90"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Mockup de Smartphone */}
          <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full flex justify-center items-center">
            <motion.div className="relative" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
              {/* Smartphone Frame */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.6 },
                    rotateY: { duration: 0.6 },
                  }}
                  className="relative"
                >
                  <Image
                    width={400}
                    height={800}
                    src={currentTheme.image || "/placeholder.svg"}
                    alt={t(currentTheme.titleKey)}
                    className="w-full h-full object-scale-down"
                    loading={currentSlide === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={currentSlide === 0 ? "high" : "auto"}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Floating Elements */}
              <motion.div
                className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-20 blur-xl`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className={`absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-30 blur-lg`}
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, 10, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />

              {/* Badge flutuante */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-black/95 rounded-full px-4 py-2 shadow-lg z-30"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full bg-gradient-to-r ${currentTheme.gradient}`}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t(currentTheme.titleKey)}</span>
                </div>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-full px-6 py-3 shadow-lg z-30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-foreground">
                    {currentSlide + 1} / {heroSlides.length}
                  </span>
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${currentTheme.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
