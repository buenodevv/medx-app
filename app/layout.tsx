import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedX Clinic - Sistema de Agendamento",
  description: "Sistema moderno de agendamento para clínicas médicas",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          <div className="hidden w-64 border-r lg:block">
            <Sidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
