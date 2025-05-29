"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Note: metadata for not-found pages should be defined in the layout
// as this is a client component due to animations

export default function NotFound() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl" animate={floatingAnimation} />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 },
          }}
        />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          {/* Logo 3D */}
          <motion.div className="mb-8 flex justify-center" animate={pulseAnimation}>
            <div className="relative">
              <motion.img
                src="/memorizu3d.png"
                alt="Memorizu 3D Logo"
                className="w-32 h-32 drop-shadow-xl"
                whileHover={{ scale: 1.1, rotateY: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl"
                animate={pulseAnimation}
              />
            </div>
          </motion.div>

          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-8xl md:text-9xl font-bold memorizu-gradient-text mb-4">404</h1>
            <motion.div
              className="w-24 h-1 memorizu-gradient mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>

          {/* Error Message */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Oops! Página não encontrada</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              A página que você está procurando não existe ou foi movida para outro lugar.
            </p>
          </motion.div>

          {/* Suggestions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-4">O que você pode fazer:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Verificar se o URL está correto
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Voltar à página inicial
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Usar o botão de busca
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Atualizar a página
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="memorizu-gradient hover:scale-105 transition-transform">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Voltar ao Início
              </Link>
            </Button>

            <Button variant="outline" size="lg" onClick={() => router.back()} className="hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Página Anterior
            </Button>

            <Button variant="ghost" size="lg" onClick={handleRefresh} disabled={isRefreshing} className="hover:scale-105 transition-transform">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }} className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">Ou procure por algo específico:</p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar templates, recursos..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push("/dashboard");
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-12 text-xs text-muted-foreground"
          >
            <p>
              Precisa de ajuda? Entre em contato conosco em{" "}
              <a href="mailto:support@memorizu.com" className="text-primary hover:underline">
                support@memorizu.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 right-10 text-6xl opacity-10"
        animate={{
          rotate: [0, 360],
          transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      >
        ✨
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-10 text-4xl opacity-10"
        animate={{
          rotate: [360, 0],
          transition: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      >
        💫
      </motion.div>
    </div>
  );
}
