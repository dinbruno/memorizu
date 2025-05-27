"use client";

import { motion } from "framer-motion";
import { Heart, Users, Globe, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: <Heart className="h-8 w-8" />,
      number: t("stats.pages.number"),
      label: t("stats.pages.label"),
      description: t("stats.pages.description"),
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <Users className="h-8 w-8" />,
      number: t("stats.users.number"),
      label: t("stats.users.label"),
      description: t("stats.users.description"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      number: t("stats.countries.number"),
      label: t("stats.countries.label"),
      description: t("stats.countries.description"),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Star className="h-8 w-8" />,
      number: t("stats.rating.number"),
      label: t("stats.rating.label"),
      description: t("stats.rating.description"),
      color: "from-amber-500 to-orange-500",
    },
  ];

  const testimonials = [
    {
      name: t("stats.testimonial1.name"),
      role: t("stats.testimonial1.role"),
      content: t("stats.testimonial1.content"),
      avatar: "MS",
      rating: 5,
    },
    {
      name: t("stats.testimonial2.name"),
      role: t("stats.testimonial2.role"),
      content: t("stats.testimonial2.content"),
      avatar: "JS",
      rating: 5,
    },
    {
      name: t("stats.testimonial3.name"),
      role: t("stats.testimonial3.role"),
      content: t("stats.testimonial3.content"),
      avatar: "AC",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-muted/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-primary/5 to-purple-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-pink-500/5 to-rose-500/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Stats Grid */}
        {/* <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>{stat.icon}</div>
              <div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 * index, type: "spring" }}
                >
                  {stat.number}
                </motion.div>
                <h3 className="font-semibold text-lg">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div> */}

        {/* Testimonials */}
        <motion.div
          className="text-center space-y-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-primary font-medium">{t("stats.testimonials.badge")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("stats.testimonials.title")}{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{t("stats.testimonials.highlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("stats.testimonials.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-background border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex justify-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
