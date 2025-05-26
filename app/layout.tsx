import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"
import { FirebaseProvider } from "@/lib/firebase/firebase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Memorizu - Crie páginas para momentos especiais",
  description: "Crie páginas personalizadas para celebrar momentos especiais com seus entes queridos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <FirebaseProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </FirebaseProvider>
      </body>
    </html>
  )
}
