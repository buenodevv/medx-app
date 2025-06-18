import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { whatsappService } from '@/lib/whatsapp-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar o agendamento
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      },
      include: {
        patient: {
          select: {
            name: true,
            phone: true
          }
        },
        profissional: {
          select: {
            name: true
          }
        },
        clinic: {
          select: {
            name: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (!appointment.patient.phone) {
      return NextResponse.json({ error: 'Paciente não possui telefone cadastrado' }, { status: 400 })
    }

    // Enviar lembrete
    const result = await whatsappService.sendReminderNotification({
      patientPhone: appointment.patient.phone,
      patientName: appointment.patient.name,
      doctorName: appointment.profissional.name,
      date: appointment.date.toISOString(),
      time: appointment.time,
      clinicName: appointment.clinic.name
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: 'Lembrete enviado com sucesso' })
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}