"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Globe, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertMessage } from "@/components/ui/alert-message";
import { useLanguage } from "@/components/language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserData, updateUserData } from "@/lib/firebase/firestore-service";
import { getContextualErrorMessage } from "@/lib/firebase/error-handler";

interface UserSettings {
  displayName: string;
  email: string;
  language: string;
  timezone: string;
  theme: string;
}

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useFirebase();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    email: "",
    language: "en",
    timezone: "UTC",
    theme: "system",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          if (userData) {
            setSettings({
              displayName: (userData as any).displayName || user.displayName || "",
              email: user.email || "",
              language: (userData as any).language || language,
              timezone: (userData as any).timezone || "UTC",
              theme: (userData as any).theme || "system",
            });
          }
        } catch (error) {
          console.error("Error loading settings:", error);
          const errorMessage = getContextualErrorMessage(error, language, "dashboard");
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSettings();
  }, [user, language]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserData(user.uid, {
        displayName: settings.displayName,
        language: settings.language,
        timezone: settings.timezone,
        theme: settings.theme,
        updatedAt: new Date(),
      });

      if (settings.language !== language) {
        setLanguage(settings.language as "en" | "pt-BR");
      }

      setSuccess(language === "pt-BR" ? "Configurações salvas com sucesso!" : "Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMessage = getContextualErrorMessage(error, language, "dashboard");
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("builder.settings")}</h1>
          <p className="text-muted-foreground mt-2">
            {language === "pt-BR" ? "Gerencie suas configurações de conta e preferências" : "Manage your account settings and preferences"}
          </p>
        </div>

        {/* Error Alert */}
        {error && <AlertMessage type="error" title={t("notification.error")} message={error} onClose={() => setError(null)} />}

        {/* Success Alert */}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {language === "pt-BR" ? "Informações do Perfil" : "Profile Information"}
                </CardTitle>
                <CardDescription>{language === "pt-BR" ? "Atualize suas informações pessoais" : "Update your personal information"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{language === "pt-BR" ? "Nome de Exibição" : "Display Name"}</Label>
                    <Input
                      id="displayName"
                      value={settings.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder={language === "pt-BR" ? "Seu nome de exibição" : "Your display name"}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "pt-BR" ? "Este nome aparecerá na mensagem de boas-vindas" : "This name will appear in the welcome message"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={settings.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      {language === "pt-BR" ? "Email não pode ser alterado" : "Email cannot be changed"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {language === "pt-BR" ? "Localização" : "Localization"}
                </CardTitle>
                <CardDescription>
                  {language === "pt-BR" ? "Defina suas preferências de idioma e fuso horário" : "Set your language and timezone preferences"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">{language === "pt-BR" ? "Idioma" : "Language"}</Label>
                    <Select value={settings.language} onValueChange={(value) => handleInputChange("language", value)}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{language === "pt-BR" ? "Fuso Horário" : "Timezone"}</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="America/Sao_Paulo">Brasília Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {language === "pt-BR" ? "Aparência" : "Appearance"}
                </CardTitle>
                <CardDescription>
                  {language === "pt-BR" ? "Personalize como o Memorizu aparece para você" : "Customize how Memorizu looks for you"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{language === "pt-BR" ? "Tema" : "Theme"}</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">{language === "pt-BR" ? "Sistema" : "System"}</SelectItem>
                      <SelectItem value="light">{language === "pt-BR" ? "Claro" : "Light"}</SelectItem>
                      <SelectItem value="dark">{language === "pt-BR" ? "Escuro" : "Dark"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? (language === "pt-BR" ? "Salvando..." : "Saving...") : language === "pt-BR" ? "Salvar Alterações" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
