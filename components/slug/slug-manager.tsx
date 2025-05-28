"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/ui/alert-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Check, X, Loader2, AlertTriangle, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { generateSlug, checkSlugAvailability, updatePage } from "@/lib/firebase/firestore-service";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

interface SlugManagerProps {
  userId: string;
  pageId: string;
  currentSlug?: string;
  pageTitle: string;
  isPaid: boolean;
  onSlugUpdate?: (newSlug: string) => void;
}

export function SlugManager({ userId, pageId, currentSlug, pageTitle, isPaid, onSlugUpdate }: SlugManagerProps) {
  const [slug, setSlug] = useState(currentSlug || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const { language } = useLanguage();

  useEffect(() => {
    if (!currentSlug && pageTitle) {
      const generatedSlug = generateSlug(pageTitle);
      setSlug(generatedSlug);
    }
  }, [pageTitle, currentSlug]);

  const checkSlug = async (slugToCheck: string) => {
    if (!slugToCheck.trim()) {
      setIsAvailable(null);
      setValidationMessage("");
      return;
    }

    // Basic validation
    if (slugToCheck.length < 3) {
      setIsAvailable(false);
      setValidationMessage(language === "pt-BR" ? "Slug deve ter pelo menos 3 caracteres" : "Slug must be at least 3 characters");
      return;
    }

    if (slugToCheck.length > 50) {
      setIsAvailable(false);
      setValidationMessage(language === "pt-BR" ? "Slug deve ter no máximo 50 caracteres" : "Slug must be at most 50 characters");
      return;
    }

    setIsChecking(true);
    setError(null);
    setValidationMessage(language === "pt-BR" ? "Verificando disponibilidade..." : "Checking availability...");

    try {
      const available = await checkSlugAvailability(userId, slugToCheck, pageId);
      setIsAvailable(available);

      if (available) {
        setValidationMessage(language === "pt-BR" ? "✓ URL disponível globalmente!" : "✓ URL available globally!");
      } else {
        setValidationMessage(language === "pt-BR" ? "✗ Esta URL já está em uso por outro usuário" : "✗ This URL is already in use by another user");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
      setValidationMessage("");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = generateSlug(value);
    setSlug(cleanSlug);
    setIsAvailable(null);
    setValidationMessage("");

    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      if (cleanSlug !== currentSlug) {
        checkSlug(cleanSlug);
      } else {
        setIsAvailable(true);
        setValidationMessage(language === "pt-BR" ? "✓ URL atual" : "✓ Current URL");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = async () => {
    if (!slug.trim() || !isAvailable) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePage(userId, pageId, { customSlug: slug });

      setSuccess(language === "pt-BR" ? "URL personalizada salva com sucesso!" : "Custom URL saved successfully!");

      onSlugUpdate?.(slug);
    } catch (error) {
      console.error("Error saving slug:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSlug = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePage(userId, pageId, { customSlug: null });
      setSlug("");
      setIsAvailable(null);
      setValidationMessage("");
      setSuccess(language === "pt-BR" ? "URL personalizada removida!" : "Custom URL removed!");
      onSlugUpdate?.("");
    } catch (error) {
      console.error("Error removing slug:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getSlugStatus = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (isAvailable === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (isAvailable === false) {
      return <X className="h-4 w-4 text-red-500" />;
    }

    return null;
  };

  const getPreviewUrl = () => {
    if (slug) {
      return `https://www.memorizu.com/p/${slug}`;
    }
    return `https://www.memorizu.com/p/seu-slug`;
  };

  if (!isPaid) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Link className="h-5 w-5" />
            {language === "pt-BR" ? "URL Personalizada" : "Custom URL"}
          </CardTitle>
          <CardDescription className="text-orange-600">
            {language === "pt-BR" ? "Disponível apenas para páginas publicadas e pagas" : "Available only for published and paid pages"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            {language === "pt-BR" ? "Recurso Premium" : "Premium Feature"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          {language === "pt-BR" ? "URL Personalizada" : "Custom URL"}
        </CardTitle>
        <CardDescription>
          {language === "pt-BR" ? "Crie uma URL única e memorável para sua página" : "Create a unique and memorable URL for your page"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

        {/* Success Alert */}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Global Uniqueness Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">{language === "pt-BR" ? "URLs Globalmente Únicas" : "Globally Unique URLs"}</p>
            <p>
              {language === "pt-BR"
                ? "Cada URL personalizada é única em toda a plataforma. Uma vez escolhida, nenhum outro usuário poderá usar a mesma URL."
                : "Each custom URL is unique across the entire platform. Once chosen, no other user can use the same URL."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">{language === "pt-BR" ? "URL Personalizada" : "Custom URL"}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder={language === "pt-BR" ? "minha-pagina-incrivel" : "my-awesome-page"}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{getSlugStatus()}</div>
              </div>
              <Button onClick={handleSave} disabled={!slug.trim() || isAvailable !== true || isSaving} className="min-w-[80px]">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : language === "pt-BR" ? "Salvar" : "Save"}
              </Button>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <p className={`text-sm ${isAvailable === true ? "text-green-600" : isAvailable === false ? "text-red-600" : "text-muted-foreground"}`}>
                {validationMessage}
              </p>
            )}
          </div>

          {/* URL Preview */}
          {slug && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{language === "pt-BR" ? "Pré-visualização da URL" : "URL Preview"}</Label>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm break-all">{getPreviewUrl()}</code>
              </div>
            </div>
          )}

          {/* Current Slug Actions */}
          {currentSlug && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-700">{language === "pt-BR" ? "URL Ativa:" : "Active URL:"}</p>
                <p className="text-sm text-green-600 font-mono">https://www.memorizu.com/p/{currentSlug}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveSlug} disabled={isSaving}>
                {language === "pt-BR" ? "Remover" : "Remove"}
              </Button>
            </div>
          )}

          {/* Guidelines */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">{language === "pt-BR" ? "Diretrizes:" : "Guidelines:"}</p>
            <ul className="space-y-1 ml-4">
              <li>• {language === "pt-BR" ? "Use apenas letras, números e hífens" : "Use only letters, numbers, and hyphens"}</li>
              <li>• {language === "pt-BR" ? "Mínimo 3 caracteres, máximo 50" : "Minimum 3 characters, maximum 50"}</li>
              <li>• {language === "pt-BR" ? "Acentos serão removidos automaticamente" : "Accents will be removed automatically"}</li>
              <li>• {language === "pt-BR" ? "Espaços serão convertidos em hífens" : "Spaces will be converted to hyphens"}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
