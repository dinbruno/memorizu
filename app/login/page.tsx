"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { t, language } = useLanguage();
  const { signIn } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs before attempting login
      if (!email.trim()) {
        setError(language === "pt-BR" ? "Email é obrigatório." : "Email is required.");
        setIsLoading(false);
        return;
      }

      if (!password.trim()) {
        setError(language === "pt-BR" ? "Senha é obrigatória." : "Password is required.");
        setIsLoading(false);
        return;
      }

      await signIn(email, password);

      setSuccess(language === "pt-BR" ? "Login realizado com sucesso!" : "Login successful!");

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.log("Login error caught:", error);
      const errorMessage = getContextualErrorMessage(error, language, "login");
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
              <CardTitle>{t("auth.login")}</CardTitle>
              <CardDescription>
                {t("auth.noAccount")}{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  {t("auth.signup")}
                </Link>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <Link href="/reset-password" className="text-sm text-primary hover:underline">
                      {t("auth.forgot")}
                    </Link>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : t("auth.login")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
