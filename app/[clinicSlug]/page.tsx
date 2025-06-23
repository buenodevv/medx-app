import { redirect } from 'next/navigation'

interface ClinicPageProps {
  params: { clinicSlug: string }
}

export default function ClinicPage({ params }: ClinicPageProps) {
  // Redireciona para o dashboard da clínica
  redirect(`/${params.clinicSlug}/dashboard`)
}