"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Calendar, Users, UserCheck, Settings, Stethoscope } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    name: "Pacientes",
    href: "/pacientes",
    icon: Users,
  },
  {
    name: "Profissionais",
    href: "/profissionais",
    icon: UserCheck,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MedX Clinic</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3", isActive && "bg-accent text-accent-foreground")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
