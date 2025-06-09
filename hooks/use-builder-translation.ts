import { useLanguage } from "@/components/language-provider";
import { builderTranslations } from "@/lib/translations/builder-translations";

export function useBuilderTranslation() {
  const { language } = useLanguage();

  // Get the translations for the current language, fallback to portuguese
  const translations = builderTranslations[language as keyof typeof builderTranslations] || builderTranslations.pt;

  return translations;
}
