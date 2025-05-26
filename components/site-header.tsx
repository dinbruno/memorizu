"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { useLanguage } from "./language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { ModeToggle } from "./mode-toggle";
import { LanguageToggle } from "./language-toggle";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useFirebase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/reset-password";
  const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/builder");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled || !isLandingPage ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {isLandingPage && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/#features" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t("nav.features")}</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/#pricing" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t("nav.pricing")}</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {isDashboardPage && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t("dashboard.title")}</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/dashboard/pages" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t("dashboard.pages")}</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />

            {!user && !isAuthPage && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">{t("nav.signup")}</Link>
                </Button>
              </>
            )}

            {user && !isDashboardPage && (
              <Button asChild>
                <Link href="/dashboard">{t("nav.dashboard")}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {isLandingPage && (
                  <>
                    <Link href="/#features" className="text-lg font-medium">
                      {t("nav.features")}
                    </Link>
                    <Link href="/#pricing" className="text-lg font-medium">
                      {t("nav.pricing")}
                    </Link>
                  </>
                )}

                {isDashboardPage && (
                  <>
                    <Link href="/dashboard" className="text-lg font-medium">
                      {t("dashboard.title")}
                    </Link>
                    <Link href="/dashboard/pages" className="text-lg font-medium">
                      {t("dashboard.pages")}
                    </Link>
                  </>
                )}

                {!user && !isAuthPage && (
                  <>
                    <Link href="/login" className="text-lg font-medium">
                      {t("nav.login")}
                    </Link>
                    <Link href="/signup" className="text-lg font-medium">
                      {t("nav.signup")}
                    </Link>
                  </>
                )}

                {user && !isDashboardPage && (
                  <Link href="/dashboard" className="text-lg font-medium">
                    {t("nav.dashboard")}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
