import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/language-provider";
import { FirebaseProvider } from "@/lib/firebase/firebase-provider";
import { HydrationWrapper } from "@/components/hydration-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Memorizu - Crie páginas para momentos especiais",
  description: "Crie páginas personalizadas e inesquecíveis para celebrar momentos especiais com quem você ama. Templates únicos, fácil de usar.",
  keywords: ["páginas personalizadas", "momentos especiais", "declaração de amor", "presentes digitais", "templates"],
  authors: [{ name: "Memorizu" }],
  creator: "Memorizu",
  publisher: "Memorizu",
  applicationName: "Memorizu",
  category: "lifestyle",
  metadataBase: new URL("https://www.memorizu.com"),
  openGraph: {
    title: "Memorizu - Crie páginas para momentos especiais",
    description: "Crie páginas personalizadas e inesquecíveis para celebrar momentos especiais com quem você ama.",
    url: "https://www.memorizu.com",
    siteName: "Memorizu",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/MEMORIZU.png",
        width: 1200,
        height: 630,
        alt: "Memorizu - Crie páginas especiais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memorizu - Crie páginas para momentos especiais",
    description: "Crie páginas personalizadas e inesquecíveis para celebrar momentos especiais com quem você ama.",
    images: ["/MEMORIZU.png"],
    creator: "@memorizu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/memorizu3d.png",
  },
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationWrapper>
          <FirebaseProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </ThemeProvider>
          </FirebaseProvider>
        </HydrationWrapper>
      </body>
    </html>
  );
}
