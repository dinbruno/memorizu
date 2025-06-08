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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { Logo } from "./logo";
import { useLanguage } from "./language-provider";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { ModeToggle } from "./mode-toggle";
import { LanguageToggle } from "./language-toggle";
import { getUserData } from "@/lib/firebase/firestore-service";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { user, signOut } = useFirebase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const getUserInitials = () => {
    if (userData?.displayName) {
      return userData.displayName
        .split(" ")
        .map((name: string) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name: string) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
                <NavigationMenuItem>
                  <Link href="/dashboard/qr-codes" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>QR Codes</NavigationMenuLink>
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

            {user && isDashboardPage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userData?.displayName || user?.displayName || user?.email}</p>
                      {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{language === "pt-BR" ? "Configurações" : "Settings"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{language === "pt-BR" ? "Sair" : "Sign out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <ModeToggle />

          {user && isDashboardPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userData?.displayName || user?.displayName || user?.email}</p>
                    {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{language === "pt-BR" ? "Configurações" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{language === "pt-BR" ? "Sair" : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                    <Link href="/dashboard/qr-codes" className="text-lg font-medium">
                      QR Codes
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
