import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ hasClinic: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    // Se o usuário não existe, criar
    if (!user) {
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: '', // Será preenchido na página de criação de clínica
          name: ''
        }
      })
      return NextResponse.json({ hasClinic: false })
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
    return NextResponse.json({ hasClinic: false }, { status: 500 })
  }
}