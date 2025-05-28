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
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-config";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { t, language } = useLanguage();
  const { signUp } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs before attempting signup
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

      if (password.length < 6) {
        setError(language === "pt-BR" ? "A senha deve ter pelo menos 6 caracteres." : "Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }

      const user = await signUp(email, password);

      // Create user document in Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
          plan: "free",
          pagesCount: 0,
        });
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError);
        // Even if Firestore fails, we can still proceed since the user was created
        setError(
          language === "pt-BR"
            ? "Conta criada, mas houve um problema ao salvar dados adicionais."
            : "Account created, but there was an issue saving additional data."
        );
        return;
      }

      setSuccess(language === "pt-BR" ? "Conta criada com sucesso!" : "Account created successfully!");

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.log("Signup error caught:", error);
      const errorMessage = getContextualErrorMessage(error, language, "signup");
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
              <CardTitle>{t("auth.signup")}</CardTitle>
              <CardDescription>
                {t("auth.hasAccount")}{" "}
                <Link href="/login" className="text-primary hover:underline">
                  {t("auth.login")}
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
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : t("auth.signup")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
