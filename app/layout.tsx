import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { WordTranslationMenu } from "@/components/word-translation-menu"
import "./globals.css"

export const metadata = {
  title: "didac",
  description: "An intelligent learning management system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 min-h-screen bg-white dark:from-slate-950 dark:to-slate-900">
                <Header />
                {children}
              </main>
              <Toaster />
              <WordTranslationMenu />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

