import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useClinicCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [hasClinic, setHasClinic] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/user/check-clinic')
        .then(res => res.json())
        .then(data => {
          setHasClinic(data.hasClinic)
          if (!data.hasClinic) {
            router.push('/create-clinic')
          }
        })
        .catch(error => {
          console.error('Erro ao verificar clínica:', error)
          setHasClinic(false)
        })
        .finally(() => setLoading(false))
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, user, router])

  return { hasClinic, loading }
}