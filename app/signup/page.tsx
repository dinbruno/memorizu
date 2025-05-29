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
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-config";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { t, language } = useLanguage();
  const { signUp, signInWithGoogle } = useFirebase();

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
          isFirstLogin: true,
          authProvider: "email",
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

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await signInWithGoogle();

      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          plan: "free",
          pagesCount: 0,
          isFirstLogin: true,
          authProvider: "google",
        });
      }

      setSuccess(language === "pt-BR" ? "Conta criada com sucesso!" : "Account created successfully!");

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.log("Google signup error caught:", error);
      const errorMessage = getContextualErrorMessage(error, language, "signup");
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
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
            <CardContent className="space-y-4">
              {/* Google Sign Up Button */}
              <GoogleAuthButton onSignIn={handleGoogleSignUp} isLoading={isGoogleLoading} variant="signup" disabled={isLoading} />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{language === "pt-BR" ? "Ou continue com" : "Or continue with"}</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? "Loading..." : t("auth.signup")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
