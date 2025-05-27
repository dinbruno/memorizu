"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

type Language = "pt-BR" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
    "hero.subtitle": "Memorizu permite criar páginas personalizadas para celebrar momentos especiais. Edite gratuitamente, publique quando quiser.",
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
    "features.create.description": "Use nosso editor drag-and-drop para criar páginas incríveis sem conhecimento técnico",
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

    // How It Works Section
    "howItWorks.badge": "Como Funciona",
    "howItWorks.title.part1": "Três Passos Simples",
    "howItWorks.title.part2": "para Criar Magia",
    "howItWorks.subtitle":
      "Transforme momentos especiais em páginas inesquecíveis. Nossa plataforma foi criada para ser simples, intuitiva e poderosa o suficiente para dar vida às suas ideias mais criativas.",
    "howItWorks.step1.title": "Escolha seu Template",
    "howItWorks.step1.subtitle": "Comece com estilo",
    "howItWorks.step1.description":
      "Selecione entre nossos templates profissionais criados especialmente para cada ocasião. Cada design foi pensado para emocionar e impressionar.",
    "howItWorks.step1.feature1": "Templates para todas as ocasiões",
    "howItWorks.step1.feature2": "Design profissional",
    "howItWorks.step1.feature3": "Otimizado para mobile",
    "howItWorks.step2.title": "Personalize com Amor",
    "howItWorks.step2.subtitle": "Toque pessoal",
    "howItWorks.step2.description":
      "Adicione suas fotos, textos, vídeos e elementos especiais. Nossa interface intuitiva torna a personalização simples e divertida.",
    "howItWorks.step2.feature1": "Editor visual intuitivo",
    "howItWorks.step2.feature2": "Upload de fotos e vídeos",
    "howItWorks.step2.feature3": "Elementos interativos",
    "howItWorks.step3.title": "Compartilhe a Magia",
    "howItWorks.step3.subtitle": "Momento especial",
    "howItWorks.step3.description": "Publique sua página e compartilhe com quem você ama. Acompanhe as visualizações e reações em tempo real.",
    "howItWorks.step3.feature1": "Link personalizado",
    "howItWorks.step3.feature2": "Compartilhamento fácil",
    "howItWorks.step3.feature3": "Analytics em tempo real",
    "howItWorks.cta": "Começar Agora Grátis",
    "howItWorks.benefits.title": "Por que escolher o",
    "howItWorks.benefits.memorizu": "Memorizu",
    "howItWorks.benefit1.title": "Criado com Amor",
    "howItWorks.benefit1.description": "Cada template é pensado para transmitir emoção",
    "howItWorks.benefit2.title": "Rápido e Fácil",
    "howItWorks.benefit2.description": "Crie sua página em poucos minutos",
    "howItWorks.benefit3.title": "Para Todos",
    "howItWorks.benefit3.description": "Interface simples que qualquer pessoa pode usar",

    // Stats Section
    "stats.pages.number": "50K+",
    "stats.pages.label": "Páginas Criadas",
    "stats.pages.description": "Momentos especiais eternizados",
    "stats.users.number": "25K+",
    "stats.users.label": "Usuários Felizes",
    "stats.users.description": "Pessoas que confiam no Memorizu",
    "stats.countries.number": "100+",
    "stats.countries.label": "Países",
    "stats.countries.description": "Amor compartilhado pelo mundo",
    "stats.rating.number": "4.9",
    "stats.rating.label": "Avaliação",
    "stats.rating.description": "Nota média dos usuários",
    "stats.testimonials.badge": "Depoimentos",
    "stats.testimonials.title": "O que nossos usuários",
    "stats.testimonials.highlight": "dizem",
    "stats.testimonials.subtitle": "Milhares de pessoas já criaram momentos inesquecíveis com o Memorizu",
    "stats.testimonial1.name": "Maria Silva",
    "stats.testimonial1.role": "Noiva",
    "stats.testimonial1.content": "Criei nosso convite de casamento no Memorizu e ficou perfeito! Todos os convidados elogiaram.",
    "stats.testimonial2.name": "João Santos",
    "stats.testimonial2.role": "Pai",
    "stats.testimonial2.content": "Fiz uma página especial para o aniversário da minha filha. Ela ficou emocionada!",
    "stats.testimonial3.name": "Ana Costa",
    "stats.testimonial3.role": "Namorada",
    "stats.testimonial3.content": "Surpreendi meu namorado com uma página no Dia dos Namorados. Ele amou!",

    // Templates Section
    "templates.badge": "Templates Profissionais",
    "templates.title": "Templates para Cada Ocasião",
    "templates.subtitle": "Designs profissionais e personalizáveis para tornar seus momentos especiais ainda mais memoráveis",
    "templates.valentines.title": "Dia dos Namorados",
    "templates.valentines.description": "Páginas românticas para celebrar o amor",
    "templates.mothers.title": "Dia das Mães",
    "templates.mothers.description": "Homenagens especiais para o Dia das Mães",
    "templates.birthday.title": "Aniversários",
    "templates.birthday.description": "Celebrações de aniversário inesquecíveis",
    "templates.wedding.title": "Casamentos",
    "templates.wedding.description": "Convites e páginas elegantes para casamentos",
    "templates.graduation.title": "Formaturas",
    "templates.graduation.description": "Celebre conquistas acadêmicas",
    "templates.christmas.title": "Natal",
    "templates.christmas.description": "Celebrações natalinas especiais",
    "templates.preview": "Preview",
    "templates.useTemplate": "Usar Este Template",
    "templates.features.gallery": "Galeria",
    "templates.features.audio": "Áudio",
    "templates.features.messages": "Mensagens",
    "templates.features.events": "Eventos",
    "templates.cta.title": "Não encontrou o que procurava?",
    "templates.cta.description": "Crie sua própria página do zero com nosso editor drag-and-drop",
    "templates.cta.button": "Começar do Zero",

    // CTA Section
    "cta.badge": "Junte-se a milhares de usuários",
    "cta.title.part1": "Pronto para criar",
    "cta.title.part2": "memórias inesquecíveis?",
    "cta.subtitle": "Comece gratuitamente hoje e transforme seus momentos especiais em páginas digitais únicas e memoráveis.",
    "cta.button.primary": "Começar Gratuitamente",
    "cta.button.secondary": "Explorar Templates",
    "cta.stats.users": "Usuários ativos",
    "cta.stats.pages": "Páginas criadas",
    "cta.stats.rating": "Avaliação média",
    "cta.stats.satisfaction": "Satisfação",
    "cta.trust.free": "✨ Grátis para sempre",
    "cta.trust.noCard": "💳 Sem cartão de crédito",
    "cta.trust.fast": "🚀 Online em minutos",

    // Footer Section
    "footer.description": "Crie páginas especiais para seus momentos únicos",
    "footer.quickLinks": "Links Rápidos",
    "footer.features": "Recursos",
    "footer.templates": "Templates",
    "footer.pricing": "Preços",
    "footer.dashboard": "Painel",
    "footer.copyright": "© 2024 Memorizu. Todos os direitos reservados.",

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
    "hero.subtitle": "Memorizu lets you create personalized pages to celebrate special moments. Edit for free, publish when ready.",
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
    "features.publish.description": "Pay only R$ 0,01 to make your page public and share with everyone",
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

    // How It Works Section
    "howItWorks.badge": "How It Works",
    "howItWorks.title.part1": "Three Simple Steps",
    "howItWorks.title.part2": "to Create Magic",
    "howItWorks.subtitle":
      "Transform special moments into unforgettable pages. Our platform was created to be simple, intuitive and powerful enough to bring your most creative ideas to life.",
    "howItWorks.step1.title": "Choose Your Template",
    "howItWorks.step1.subtitle": "Start with style",
    "howItWorks.step1.description":
      "Select from our professional templates created especially for each occasion. Each design was designed to excite and impress.",
    "howItWorks.step1.feature1": "Templates for all occasions",
    "howItWorks.step1.feature2": "Professional design",
    "howItWorks.step1.feature3": "Mobile optimized",
    "howItWorks.step2.title": "Personalize with Love",
    "howItWorks.step2.subtitle": "Personal touch",
    "howItWorks.step2.description":
      "Add your photos, texts, videos and special elements. Our intuitive interface makes customization simple and fun.",
    "howItWorks.step2.feature1": "Intuitive visual editor",
    "howItWorks.step2.feature2": "Photo and video upload",
    "howItWorks.step2.feature3": "Interactive elements",
    "howItWorks.step3.title": "Share the Magic",
    "howItWorks.step3.subtitle": "Special moment",
    "howItWorks.step3.description": "Publish your page and share it with those you love. Track views and reactions in real time.",
    "howItWorks.step3.feature1": "Custom link",
    "howItWorks.step3.feature2": "Easy sharing",
    "howItWorks.step3.feature3": "Real-time analytics",
    "howItWorks.cta": "Start Now for Free",
    "howItWorks.benefits.title": "Why choose",
    "howItWorks.benefits.memorizu": "Memorizu",
    "howItWorks.benefit1.title": "Made with Love",
    "howItWorks.benefit1.description": "Each template is designed to convey emotion",
    "howItWorks.benefit2.title": "Fast and Easy",
    "howItWorks.benefit2.description": "Create your page in just a few minutes",
    "howItWorks.benefit3.title": "For Everyone",
    "howItWorks.benefit3.description": "Simple interface that anyone can use",

    // Stats Section
    "stats.pages.number": "50K+",
    "stats.pages.label": "Pages Created",
    "stats.pages.description": "Special moments eternalized",
    "stats.users.number": "25K+",
    "stats.users.label": "Happy Users",
    "stats.users.description": "People who trust Memorizu",
    "stats.countries.number": "100+",
    "stats.countries.label": "Countries",
    "stats.countries.description": "Love shared around the world",
    "stats.rating.number": "4.9",
    "stats.rating.label": "Rating",
    "stats.rating.description": "Average user rating",
    "stats.testimonials.badge": "Testimonials",
    "stats.testimonials.title": "What our users",
    "stats.testimonials.highlight": "say",
    "stats.testimonials.subtitle": "Thousands of people have already created unforgettable moments with Memorizu",
    "stats.testimonial1.name": "Maria Silva",
    "stats.testimonial1.role": "Bride",
    "stats.testimonial1.content": "I created our wedding invitation on Memorizu and it was perfect! All the guests praised it.",
    "stats.testimonial2.name": "João Santos",
    "stats.testimonial2.role": "Father",
    "stats.testimonial2.content": "I made a special page for my daughter's birthday. She was thrilled!",
    "stats.testimonial3.name": "Ana Costa",
    "stats.testimonial3.role": "Girlfriend",
    "stats.testimonial3.content": "I surprised my boyfriend with a Valentine's Day page. He loved it!",

    // Templates Section
    "templates.badge": "Professional Templates",
    "templates.title": "Templates for Every Occasion",
    "templates.subtitle": "Professional and customizable designs to make your special moments even more memorable",
    "templates.valentines.title": "Valentine's Day",
    "templates.valentines.description": "Romantic pages to celebrate love",
    "templates.mothers.title": "Mother's Day",
    "templates.mothers.description": "Special tributes for Mother's Day",
    "templates.birthday.title": "Birthdays",
    "templates.birthday.description": "Unforgettable birthday celebrations",
    "templates.wedding.title": "Weddings",
    "templates.wedding.description": "Elegant invitations and pages for weddings",
    "templates.graduation.title": "Graduations",
    "templates.graduation.description": "Celebrate academic achievements",
    "templates.christmas.title": "Christmas",
    "templates.christmas.description": "Special Christmas celebrations",
    "templates.preview": "Preview",
    "templates.useTemplate": "Use This Template",
    "templates.features.gallery": "Gallery",
    "templates.features.audio": "Audio",
    "templates.features.messages": "Messages",
    "templates.features.events": "Events",
    "templates.cta.title": "Didn't find what you were looking for?",
    "templates.cta.description": "Create your own page from scratch with our drag-and-drop editor",
    "templates.cta.button": "Start from Scratch",

    // CTA Section
    "cta.badge": "Join thousands of users",
    "cta.title.part1": "Ready to create",
    "cta.title.part2": "unforgettable memories?",
    "cta.subtitle": "Start for free today and turn your special moments into unique digital pages and memories.",
    "cta.button.primary": "Start for Free",
    "cta.button.secondary": "Explore Templates",
    "cta.stats.users": "Active Users",
    "cta.stats.pages": "Pages Created",
    "cta.stats.rating": "Average Rating",
    "cta.stats.satisfaction": "Satisfaction",
    "cta.trust.free": "✨ Free Forever",
    "cta.trust.noCard": "💳 No Credit Card",
    "cta.trust.fast": "🚀 Online in Minutes",

    // Footer Section
    "footer.description": "Create special pages for your unique moments",
    "footer.quickLinks": "Quick Links",
    "footer.features": "Features",
    "footer.templates": "Templates",
    "footer.pricing": "Pricing",
    "footer.dashboard": "Dashboard",
    "footer.copyright": "© 2024 Memorizu. All rights reserved.",

    // Pricing
    "pricing.title": "Pricing",
    "pricing.subtitle": "Choose the ideal plan for you",
    "pricing.publication.title": "Page Publication",
    "pricing.publication.price": "R$ 0,01",
    "pricing.publication.description": "One-time payment per page",
    "pricing.publication.feature1": "Free creation and editing",
    "pricing.publication.feature2": "All components included",
    "pricing.publication.feature3": "Effects and animations",
    "pricing.publication.feature4": "Permanent public URL",
    "pricing.publication.cta": "Start free",

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
    "how.step3": "Publish for R$ 0,01",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR");

  useEffect(() => {
    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith("en")) {
      setLanguageState("en");
    }

    // Check localStorage
    const storedLang = localStorage.getItem("memorizu-language") as Language;
    if (storedLang && (storedLang === "pt-BR" || storedLang === "en")) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("memorizu-language", lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
