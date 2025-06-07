import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user) {
      // Criar usuário se não existir
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: '',
          name: ''
        }
      })
      return NextResponse.json({ hasClinic: false, user: null })
    }

    return NextResponse.json({ 
      hasClinic: !!user.clinicId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        clinic: user.clinic
      }
    })
  } catch (error) {
    console.error('Erro ao verificar clínica:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}