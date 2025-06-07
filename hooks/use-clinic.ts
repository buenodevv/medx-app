import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface Clinic {
  id: string
  name: string
  cnpj?: string
  address?: string
  phone?: string
  email?: string
}

export function useClinic() {
  const { user } = useUser()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchClinic()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchClinic = async () => {
    try {
      const response = await fetch('/api/user/clinic')
      if (response.ok) {
        const data = await response.json()
        setClinic(data.user?.clinic || null)
      }
    } catch (error) {
      console.error('Erro ao buscar clínica:', error)
    } finally {
      setLoading(false)
    }
  }

  return { clinic, loading, refetch: fetchClinic }
}