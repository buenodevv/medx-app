'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

interface ClinicGuardProps {
  children: React.ReactNode
}

const publicRoutes = ['/', '/sign-in', '/sign-up', '/create-clinic']

export function ClinicGuard({ children }: ClinicGuardProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [hasClinic, setHasClinic] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  useEffect(() => {
    if (isPublicRoute) {
      setLoading(false)
      return
    }

    if (isLoaded && user) {
      fetch('/api/user/clinic')
        .then(res => res.json())
        .then(data => {
          setHasClinic(data.hasClinic)
          if (!data.hasClinic && !isPublicRoute) {
            router.push('/create-clinic')
          }
        })
        .catch(error => {
          console.error('Erro ao verificar clínica:', error)
          // Em caso de erro, permitir acesso
          setHasClinic(true)
        })
        .finally(() => setLoading(false))
    } else if (isLoaded && !user && !isPublicRoute) {
      // Usuário não autenticado, redirecionar para login
      router.push('/sign-in')
      setLoading(false)
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, user, router, pathname, isPublicRoute])

  // Mostrar loading enquanto verifica
  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se é rota pública, mostrar sem layout
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Se não tem clínica, mostrar loading de redirecionamento
  if (hasClinic === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecionando para configuração...</p>
        </div>
      </div>
    )
  }

  // Mostrar com layout completo - CORRIGIDO
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar com largura fixa */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
       <Header title={getPageTitle(pathname)} />
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Função para obter o título da página baseado na rota
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pacientes': 'Pacientes',
    '/agenda': 'Agenda',
    '/profissionais': 'Profissionais',
    '/create-clinic': 'Criar Clínica'
  }
  
  return routes[pathname] || 'MedX'
}