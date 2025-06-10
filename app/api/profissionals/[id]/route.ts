import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar profissional
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Usuário não associado a uma clínica' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { name, phone, email, crm, image, specialty, consultationPrice, workingDays } = body

    // Verificar se o profissional existe e pertence à clínica do usuário
    const existingProfissional = await prisma.profissional.findFirst({
      where: {
        id,
        clinicId: user.clinicId
      }
    })

    if (!existingProfissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Validações básicas
    if (!name || !email || !crm) {
      return NextResponse.json(
        { error: 'Nome, email e CRM são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe (exceto para o próprio profissional)
    if (email !== existingProfissional.email) {
      const existingProfissionalByEmail = await prisma.profissional.findUnique({
        where: { email }
      })

      if (existingProfissionalByEmail) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Verificar se CRM já existe (exceto para o próprio profissional)
    if (crm !== existingProfissional.crm) {
      const existingProfissionalByCrm = await prisma.profissional.findUnique({
        where: { crm }
      })

      if (existingProfissionalByCrm) {
        return NextResponse.json(
          { error: 'CRM já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Atualizar profissional
    const profissional = await prisma.profissional.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        crm,
        image,
        specialty,
        consultationPrice: consultationPrice ? parseFloat(consultationPrice) : null,
        workingDays: {
          deleteMany: {}, // Remove todos os dias existentes
          create: workingDays?.map((day: any) => ({
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime
          })) || []
        }
      },
      include: {
        workingDays: {
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    return NextResponse.json(profissional)
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir profissional
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Usuário não associado a uma clínica' }, { status: 403 })
    }

    const { id } = params

    // Verificar se o profissional existe e pertence à clínica do usuário
    const existingProfissional = await prisma.profissional.findFirst({
      where: {
        id,
        clinicId: user.clinicId
      }
    })

    if (!existingProfissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Excluir profissional (os dias de trabalho serão excluídos automaticamente devido ao onDelete: Cascade)
    await prisma.profissional.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Profissional excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}