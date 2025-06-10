import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppointmentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'Usuário não associado a uma clínica' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const profissionalId = searchParams.get('profissionalId')

    // Buscar agendamentos da clínica
    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId: user.clinicId,
        ...(date && {
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z')
          }
        }),
        ...(profissionalId && { profissionalId })
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        profissional: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'Usuário não associado a uma clínica' }, { status: 400 })
    }

    const body = await request.json()
    const { patientId, profissionalId, date, time, notes } = body

    // Validações básicas
    if (!patientId || !profissionalId || !date || !time) {
      return NextResponse.json({ error: 'Campos obrigatórios: paciente, profissional, data e horário' }, { status: 400 })
    }

    // Verificar se o paciente pertence à clínica
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId: user.clinicId
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado ou não pertence à clínica' }, { status: 400 })
    }

    // Verificar se o profissional pertence à clínica
    const profissional = await prisma.profissional.findFirst({
      where: {
        id: profissionalId,
        clinicId: user.clinicId
      }
    })

    if (!profissional) {
      return NextResponse.json({ error: 'Profissional não encontrado ou não pertence à clínica' }, { status: 400 })
    }

    // Verificar se já existe agendamento no mesmo horário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        profissionalId,
        date: new Date(date),
        time,
        status: {
          not: AppointmentStatus.CANCELADO
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json({ error: 'Já existe um agendamento neste horário' }, { status: 400 })
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        profissionalId,
        clinicId: user.clinicId,
        date: new Date(date),
        time,
        notes: notes || null,
        status: AppointmentStatus.AGENDADO
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        profissional: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}