import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DashboardContent from '@/components/dashboard-content'
import { createClinicSlug } from '@/lib/clinic-utils'

interface ClinicDashboardProps {
  params: { clinicSlug: string }
}

async function getClinicBySlug(slug: string) {
  const clinics = await prisma.clinic.findMany({
    select: {
      id: true,
      name: true,
    }
  })

  return clinics.find(clinic => createClinicSlug(clinic.name) === slug)
}

export default async function ClinicDashboard({ params }: ClinicDashboardProps) {
  const { userId } = await auth()
  
  if (!userId) {
    notFound()
  }

  const clinic = await getClinicBySlug(params.clinicSlug)
  
  if (!clinic) {
    notFound()
  }

  // Verificar se o usuário tem acesso a esta clínica
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { clinic: true }
  })

  if (!user || user.clinicId !== clinic.id) {
    notFound()
  }

  return <DashboardContent clinicId={clinic.id} clinicName={clinic.name} />
}