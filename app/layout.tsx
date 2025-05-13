import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import { SessionProvider } from "@/lib/session-context";
import { ToastToasterProvider } from "@/hooks/use-toast";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartPlate - Smart Meal Planning Made Simple",
  description:
    "Personalized meal plans, automated grocery lists, and nutritional insights tailored to your dietary needs and preferences.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.png" type="image/png" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground antialiased`}>
        <SessionProvider>
          <ToastToasterProvider>
            {children}
          </ToastToasterProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
