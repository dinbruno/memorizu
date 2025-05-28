"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (name: string) => void;
}

// Confetti component using CSS animations
const Confetti = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="absolute animate-confetti-fall"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
        backgroundColor: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"][Math.floor(Math.random() * 4)],
        width: "10px",
        height: "10px",
      }}
    />
  ));

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] overflow-hidden">{confettiPieces}</div>;
};

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [name, setName] = useState("");
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <>
      {isOpen && <Confetti />}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md"
            >
              <Card className="shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", duration: 0.6 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-red-600">
                    {language === "pt-BR" ? "Bem-vindo ao Memorizu!" : "Welcome to Memorizu!"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {language === "pt-BR"
                      ? "Estamos muito felizes em tê-lo conosco! Como gostaria de ser chamado?"
                      : "We're so happy to have you with us! What would you like to be called?"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {language === "pt-BR" ? "Seu nome" : "Your name"}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={language === "pt-BR" ? "Digite seu nome..." : "Enter your name..."}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-center text-lg"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={!name.trim()}>
                        {language === "pt-BR" ? "Continuar" : "Continue"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
