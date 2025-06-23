import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { createClinicSlug } from '@/lib/clinic-utils'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

interface ClinicLayoutProps {
  children: React.ReactNode
  params: { clinicSlug: string }
}

async function getClinicBySlug(slug: string) {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
      }
    })

    return clinics.find(clinic => createClinicSlug(clinic.name) === slug)
  } catch (error) {
    console.error('Erro ao buscar clínica:', error)
    return null
  }
}

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pacientes': 'Pacientes',
    '/agenda': 'Agenda',
    '/profissionais': 'Profissionais',
  }
  
  // Extrair a parte da rota após o slug da clínica
  const routePart = pathname.split('/').slice(2).join('/')
  return routes[`/${routePart}`] || 'Dashboard'
}

export default async function ClinicLayout({ children, params }: ClinicLayoutProps) {
  const { userId } = await auth()
  
  if (!userId) {
    notFound()
  }

  const clinic = await getClinicBySlug(params.clinicSlug)
  
  if (!clinic) {
    notFound()
  }

  // Verificar se o usuário tem acesso a esta clínica
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || user.clinicId !== clinic.id) {
      notFound()
    }
  } catch (error) {
    console.error('Erro ao verificar acesso do usuário:', error)
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar com largura fixa */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getPageTitle(`/${params.clinicSlug}`)} />
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}