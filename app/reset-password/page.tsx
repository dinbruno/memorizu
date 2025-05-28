"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/ui/alert-message";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { resetPassword } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate email before attempting reset
      if (!email.trim()) {
        setError(language === "pt-BR" ? "Email é obrigatório." : "Email is required.");
        setIsLoading(false);
        return;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError(language === "pt-BR" ? "Por favor, insira um email válido." : "Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      await resetPassword(email.trim());

      setIsSent(true);
      setSuccess(language === "pt-BR" ? "Email de recuperação enviado! Verifique sua caixa de entrada." : "Reset email sent! Check your inbox.");
    } catch (error) {
      console.log("Password reset error caught:", error);
      const errorMessage = getContextualErrorMessage(error, language, "reset-password");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          {/* Error Alert */}
          {error && <AlertMessage type="error" title={t("notification.error")} message={error} onClose={() => setError(null)} className="mb-4" />}

          {/* Success Alert */}
          {success && <AlertMessage type="success" message={success} className="mb-4" />}

          <Card>
            <CardHeader>
              <CardTitle>{t("auth.reset")}</CardTitle>
              <CardDescription>
                {isSent
                  ? language === "pt-BR"
                    ? "Email de recuperação enviado! Verifique sua caixa de entrada."
                    : "Reset email sent! Check your inbox."
                  : t("auth.resetInstructions")}
              </CardDescription>
            </CardHeader>
            {!isSent && (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (language === "pt-BR" ? "Enviando..." : "Sending...") : t("auth.reset")}
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/login">{t("auth.login")}</Link>
                  </Button>
                </CardFooter>
              </form>
            )}
            {isSent && (
              <CardFooter className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">{t("auth.login")}</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsSent(false);
                    setEmail("");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  {language === "pt-BR" ? "Enviar novamente" : "Send again"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
