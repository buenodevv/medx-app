import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Listar profissionais da clínica
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const whereClause: any = {
      clinicId: user.clinicId
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { crm: { contains: search } },
        { specialty: { contains: search } }
      ]
    }

    const profissionals = await prisma.profissional.findMany({
      where: whereClause,
      include: {
        workingDays: {
          orderBy: { dayOfWeek: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(profissionals)
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo profissional
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, phone, email, crm, image, specialty, workingDays } = body

    // Validações básicas
    if (!name || !email || !crm) {
      return NextResponse.json(
        { error: 'Nome, email e CRM são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingProfissionalByEmail = await prisma.profissional.findUnique({
      where: { email }
    })

    if (existingProfissionalByEmail) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se CRM já existe
    const existingProfissionalByCrm = await prisma.profissional.findUnique({
      where: { crm }
    })

    if (existingProfissionalByCrm) {
      return NextResponse.json(
        { error: 'CRM já cadastrado' },
        { status: 400 }
      )
    }

    // Criar profissional com dias de trabalho
    const profissional = await prisma.profissional.create({
      data: {
        name,
        phone,
        email,
        crm,
        image,
        specialty,
        clinicId: user.clinicId,
        workingDays: {
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

    return NextResponse.json(profissional, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}