"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "pt-BR" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  "pt-BR": {
    // Navbar
    "nav.home": "Início",
    "nav.features": "Recursos",
    "nav.pricing": "Preços",
    "nav.login": "Entrar",
    "nav.signup": "Cadastrar",
    "nav.dashboard": "Painel",

    // Hero
    "hero.badge": "🎉 Confiado por mais de 10.000 criadores no mundo todo",
    "hero.title.part1": "Crie páginas",
    "hero.title.part2": "especiais",
    "hero.title.part3": "para seus momentos únicos",
    "hero.subtitle":
      "Memorizu permite criar páginas personalizadas para celebrar momentos especiais. Edite gratuitamente, publique quando quiser.",
    "hero.cta": "Criar página grátis",
    "hero.secondary": "Ver como funciona",
    "hero.free_create": "Grátis para criar",
    "hero.pay_publish": "Pague apenas para publicar",
    "hero.live_minutes": "No ar em 2 minutos",
    "hero.no_credit_card": "Não precisa de cartão",
    "hero.mobile_responsive": "Responsivo no celular",
    "hero.share_anywhere": "Compartilhe em qualquer lugar",

    // Features
    "features.title": "Como funciona",
    "features.subtitle": "Simples, rápido e eficiente",
    "features.create.title": "Crie gratuitamente",
    "features.create.description":
      "Use nosso editor drag-and-drop para criar páginas incríveis sem conhecimento técnico",
    "features.customize.title": "Personalize tudo",
    "features.customize.description": "Adicione textos, imagens, efeitos e componentes especiais para sua ocasião",
    "features.publish.title": "Publique quando quiser",
    "features.publish.description": "Pague apenas R$ 24,90 para tornar sua página pública e compartilhar com todos",
    "features.drag_drop.title": "Editor Drag & Drop",
    "features.drag_drop.description": "Interface intuitiva para criar páginas sem conhecimento técnico",
    "features.templates.title": "Templates Prontos",
    "features.templates.description": "Diversos templates para diferentes ocasiões especiais",
    "features.effects.title": "Efeitos Mágicos",
    "features.effects.description": "Adicione animações e efeitos visuais incríveis",
    "features.responsive.title": "Totalmente Responsivo",
    "features.responsive.description": "Suas páginas ficam perfeitas em qualquer dispositivo",
    "features.sharing.title": "Compartilhamento Fácil",
    "features.sharing.description": "Gere um link único para compartilhar com quem você ama",
    "features.analytics.title": "Relatórios Detalhados",
    "features.analytics.description": "Acompanhe visualizações e engajamento das suas páginas",

    // Pricing
    "pricing.title": "Preços",
    "pricing.subtitle": "Escolha o plano ideal para você",
    "pricing.publication.title": "Publicação de Página",
    "pricing.publication.price": "R$ 24,90",
    "pricing.publication.description": "Pagamento único por página",
    "pricing.publication.feature1": "Criação e edição gratuita",
    "pricing.publication.feature2": "Todos os componentes inclusos",
    "pricing.publication.feature3": "Efeitos e animações",
    "pricing.publication.feature4": "URL pública permanente",
    "pricing.publication.cta": "Começar grátis",

    // Footer
    "footer.product": "Produto",
    "footer.company": "Empresa",
    "footer.legal": "Legal",
    "footer.copyright": "© 2024 Memorizu. Todos os direitos reservados.",

    // Auth
    "auth.login": "Entrar",
    "auth.signup": "Cadastrar",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.forgot": "Esqueceu a senha?",
    "auth.noAccount": "Não tem uma conta?",
    "auth.hasAccount": "Já tem uma conta?",
    "auth.reset": "Redefinir senha",
    "auth.resetInstructions": "Digite seu email e enviaremos instruções para redefinir sua senha.",
    "auth.resetSent": "Email enviado! Verifique sua caixa de entrada.",

    // Dashboard
    "dashboard.title": "Painel",
    "dashboard.welcome": "Bem-vindo ao Memorizu",
    "dashboard.pages": "Minhas Páginas",
    "dashboard.create": "Criar Nova Página",
    "dashboard.empty": "Você ainda não criou nenhuma página",
    "dashboard.start": "Comece criando sua primeira página",
    "dashboard.published": "Publicada",
    "dashboard.draft": "Rascunho",
    "dashboard.pending": "Pendente",
    "dashboard.edit": "Editar",
    "dashboard.view": "Visualizar",
    "dashboard.publish": "Publicar",
    "dashboard.delete": "Excluir",
    "dashboard.last_modified": "Última modificação",
    "dashboard.components_count": "componentes",
    "dashboard.template": "Template",

    // Builder
    "builder.save": "Salvar",
    "builder.publish": "Publicar",
    "builder.preview": "Visualizar",
    "builder.components": "Componentes",
    "builder.settings": "Configurações",
    "builder.templates": "Templates",
    "builder.text": "Texto",
    "builder.image": "Imagem",
    "builder.video": "Vídeo",
    "builder.button": "Botão",
    "builder.section": "Seção",
    "builder.effects": "Efeitos",
    "builder.colors": "Cores",
    "builder.fonts": "Fontes",
    "builder.background": "Fundo",
    "builder.untitled": "Página sem título",

    // Templates
    "templates.valentines": "Dia dos Namorados",
    "templates.mothers": "Dia das Mães",
    "templates.birthday": "Aniversário",
    "templates.wedding": "Casamento",
    "templates.graduation": "Formatura",

    // Components
    "component.header": "Cabeçalho",
    "component.hero": "Hero",
    "component.gallery": "Galeria",
    "component.quote": "Citação",
    "component.timeline": "Linha do tempo",
    "component.countdown": "Contagem regressiva",
    "component.message": "Mensagem",
    "component.footer": "Rodapé",

    // Notifications
    "notification.saved": "Página salva com sucesso!",
    "notification.published": "Página publicada com sucesso!",
    "notification.error": "Ocorreu um erro. Tente novamente.",
    "notification.login": "Login realizado com sucesso!",
    "notification.logout": "Logout realizado com sucesso!",

    // How to use
    "how.title": "Como usar",
    "how.step1": "Crie sua conta",
    "how.step2": "Edite sua página",
    "how.step3": "Publique por R$ 24,90",
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",

    // Hero
    "hero.badge": "🎉 Trusted by 10,000+ creators worldwide",
    "hero.title.part1": "Create",
    "hero.title.part2": "special",
    "hero.title.part3": "pages for your unique moments",
    "hero.subtitle":
      "Memorizu lets you create personalized pages to celebrate special moments. Edit for free, publish when ready.",
    "hero.cta": "Create free page",
    "hero.secondary": "See how it works",
    "hero.free_create": "Free to create",
    "hero.pay_publish": "Pay only to publish",
    "hero.live_minutes": "Live in 2 minutes",
    "hero.no_credit_card": "No Credit Card Required",
    "hero.mobile_responsive": "Mobile Responsive",
    "hero.share_anywhere": "Share Anywhere",

    // Features
    "features.title": "How it works",
    "features.subtitle": "Simple, fast and efficient",
    "features.create.title": "Create for free",
    "features.create.description": "Use our drag-and-drop editor to create amazing pages without technical knowledge",
    "features.customize.title": "Customize everything",
    "features.customize.description": "Add texts, images, effects and special components for your occasion",
    "features.publish.title": "Publish when ready",
    "features.publish.description": "Pay only $4.99 to make your page public and share with everyone",
    "features.drag_drop.title": "Drag & Drop Editor",
    "features.drag_drop.description": "Intuitive interface to create pages without technical knowledge",
    "features.templates.title": "Ready Templates",
    "features.templates.description": "Various templates for different special occasions",
    "features.effects.title": "Magic Effects",
    "features.effects.description": "Add stunning animations and visual effects",
    "features.responsive.title": "Fully Responsive",
    "features.responsive.description": "Your pages look perfect on any device",
    "features.sharing.title": "Easy Sharing",
    "features.sharing.description": "Generate a unique link to share with those you love",
    "features.analytics.title": "Detailed Reports",
    "features.analytics.description": "Track views and engagement of your pages",

    // Pricing
    "pricing.title": "Pricing",
    "pricing.subtitle": "Choose the ideal plan for you",
    "pricing.publication.title": "Page Publication",
    "pricing.publication.price": "$4.99",
    "pricing.publication.description": "One-time payment per page",
    "pricing.publication.feature1": "Free creation and editing",
    "pricing.publication.feature2": "All components included",
    "pricing.publication.feature3": "Effects and animations",
    "pricing.publication.feature4": "Permanent public URL",
    "pricing.publication.cta": "Start free",

    // Footer
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.copyright": "© 2024 Memorizu. All rights reserved.",

    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgot": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.reset": "Reset password",
    "auth.resetInstructions": "Enter your email and we'll send instructions to reset your password.",
    "auth.resetSent": "Email sent! Check your inbox.",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to Memorizu",
    "dashboard.pages": "My Pages",
    "dashboard.create": "Create New Page",
    "dashboard.empty": "You haven't created any pages yet",
    "dashboard.start": "Start by creating your first page",
    "dashboard.published": "Published",
    "dashboard.draft": "Draft",
    "dashboard.pending": "Pending",
    "dashboard.edit": "Edit",
    "dashboard.view": "View",
    "dashboard.publish": "Publish",
    "dashboard.delete": "Delete",
    "dashboard.last_modified": "Last modified",
    "dashboard.components_count": "components",
    "dashboard.template": "Template",

    // Builder
    "builder.save": "Save",
    "builder.publish": "Publish",
    "builder.preview": "Preview",
    "builder.components": "Components",
    "builder.settings": "Settings",
    "builder.templates": "Templates",
    "builder.text": "Text",
    "builder.image": "Image",
    "builder.video": "Video",
    "builder.button": "Button",
    "builder.section": "Section",
    "builder.effects": "Effects",
    "builder.colors": "Colors",
    "builder.fonts": "Fonts",
    "builder.background": "Background",
    "builder.untitled": "Untitled Page",

    // Templates
    "templates.valentines": "Valentine's Day",
    "templates.mothers": "Mother's Day",
    "templates.birthday": "Birthday",
    "templates.wedding": "Wedding",
    "templates.graduation": "Graduation",

    // Components
    "component.header": "Header",
    "component.hero": "Hero",
    "component.gallery": "Gallery",
    "component.quote": "Quote",
    "component.timeline": "Timeline",
    "component.countdown": "Countdown",
    "component.message": "Message",
    "component.footer": "Footer",

    // Notifications
    "notification.saved": "Page saved successfully!",
    "notification.published": "Page published successfully!",
    "notification.error": "An error occurred. Please try again.",
    "notification.login": "Login successful!",
    "notification.logout": "Logout successful!",

    // How to use
    "how.title": "How to use",
    "how.step1": "Create your account",
    "how.step2": "Edit your page",
    "how.step3": "Publish for $4.99",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR")

  useEffect(() => {
    // Check browser language
    const browserLang = navigator.language
    if (browserLang.startsWith("en")) {
      setLanguageState("en")
    }

    // Check localStorage
    const storedLang = localStorage.getItem("memorizu-language") as Language
    if (storedLang && (storedLang === "pt-BR" || storedLang === "en")) {
      setLanguageState(storedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("memorizu-language", lang)
  }

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
