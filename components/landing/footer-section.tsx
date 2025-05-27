"use client";

import { useLanguage } from "@/components/language-provider";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function FooterSection() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t("footer.features"), href: "/#features" },
    { label: t("footer.templates"), href: "/#templates" },
    { label: t("footer.pricing"), href: "/#pricing" },
    { label: t("footer.dashboard"), href: "/dashboard" },
  ];

  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground max-w-md">{t("footer.description")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-muted-foreground">{t("footer.copyright")}</div>
      </div>
    </footer>
  );
}
