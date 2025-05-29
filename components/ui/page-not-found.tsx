"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Lock, CreditCard, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageNotFoundProps {
  title?: string;
  message?: string;
  reason?: "not-found" | "not-published" | "not-paid" | "access-denied";
  debugInfo?: {
    pageId?: string;
    slug?: string;
    route?: string;
  };
}

export function PageNotFound({
  title = "Página não encontrada",
  message = "A página que você está procurando não existe ou não está disponível.",
  reason = "not-found",
  debugInfo,
}: PageNotFoundProps) {
  const router = useRouter();

  const getReasonIcon = () => {
    switch (reason) {
      case "not-published":
        return <Eye className="w-12 h-12 text-orange-500" />;
      case "not-paid":
        return <CreditCard className="w-12 h-12 text-red-500" />;
      case "access-denied":
        return <Lock className="w-12 h-12 text-red-500" />;
      default:
        return <div className="text-6xl">🔍</div>;
    }
  };

  const getReasonMessage = () => {
    switch (reason) {
      case "not-published":
        return "Esta página ainda não foi publicada pelo autor.";
      case "not-paid":
        return "Esta página está aguardando confirmação de pagamento.";
      case "access-denied":
        return "Você não tem permissão para acessar esta página.";
      default:
        return message;
    }
  };

  const getReasonSuggestions = () => {
    switch (reason) {
      case "not-published":
        return [
          "A página pode estar em modo rascunho",
          "O autor ainda não finalizou o conteúdo",
          "Verifique se o link está correto",
          "Tente novamente mais tarde",
        ];
      case "not-paid":
        return [
          "O pagamento pode estar sendo processado",
          "Verifique se o pagamento foi confirmado",
          "Entre em contato com o suporte",
          "Tente novamente em alguns minutos",
        ];
      case "access-denied":
        return ["Esta pode ser uma página privada", "Faça login se necessário", "Verifique suas permissões", "Entre em contato com o autor"];
      default:
        return ["Verificar se o URL está correto", "Voltar à página inicial", "Usar o botão de busca", "Atualizar a página"];
    }
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

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="p-6 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full">{getReasonIcon()}</div>
          </motion.div>

          {/* Error Message */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 memorizu-gradient-text">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">{getReasonMessage()}</p>
          </motion.div>

          {/* Suggestions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-4">Possíveis soluções:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                {getReasonSuggestions().map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {suggestion}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Debug Info (only in development) */}
          {debugInfo && process.env.NODE_ENV === "development" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="mb-8">
              <Card className="p-4 bg-muted/50 backdrop-blur-sm border-muted">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Debug Info (dev only):</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {debugInfo.pageId && (
                    <p>
                      <strong>Page ID:</strong> {debugInfo.pageId}
                    </p>
                  )}
                  {debugInfo.slug && (
                    <p>
                      <strong>Slug:</strong> {debugInfo.slug}
                    </p>
                  )}
                  {debugInfo.route && (
                    <p>
                      <strong>Route:</strong> {debugInfo.route}
                    </p>
                  )}
                  <p className="mt-2">Check browser console for detailed logs.</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
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
