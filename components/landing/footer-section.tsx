"use client";

import { useLanguage } from "@/components/language-provider";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function FooterSection() {
  const { t } = useLanguage();

  const productLinks = [
    { label: t("nav.features"), href: "/#features" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: t("builder.templates"), href: "/#templates" },
  ];

  const companyLinks = [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ];

  const legalLinks = [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookies", href: "#" },
  ];

  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground">Create beautiful pages for your special moments.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.product")}</h3>
            <ul className="space-y-2">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-6 text-center text-muted-foreground">{t("footer.copyright")}</div>
      </div>
    </footer>
  );
}
