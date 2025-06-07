import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, cnpj, address, phone, email } = body

    // Verificar se o usuário já tem uma clínica
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (existingUser?.clinic) {
      return NextResponse.json({ error: 'Usuário já possui uma clínica' }, { status: 400 })
    }

    // Criar a clínica
    const clinic = await prisma.clinic.create({
      data: {
        name,
        cnpj,
        address,
        phone,
        email
      }
    })

    // Atualizar o usuário com a clínica
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { clinicId: clinic.id }
      })
    } else {
      // Criar usuário se não existir
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: '', // Será preenchido pelo Clerk
          clinicId: clinic.id
        }
      })
    }

    return NextResponse.json({ clinic })
  } catch (error) {
    console.error('Erro ao criar clínica:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

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

    return NextResponse.json({ clinic: user?.clinic || null })
  } catch (error) {
    console.error('Erro ao buscar clínica:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}