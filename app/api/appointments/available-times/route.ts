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
    const profissionalId = searchParams.get('profissionalId')
    const date = searchParams.get('date')

    if (!profissionalId || !date) {
      return NextResponse.json({ error: 'Profissional e data são obrigatórios' }, { status: 400 })
    }

    // Verificar se o profissional pertence à clínica
    const profissional = await prisma.profissional.findFirst({
      where: {
        id: profissionalId,
        clinicId: user.clinicId
      },
      include: {
        workingDays: true
      }
    })

    if (!profissional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
    }

    // Verificar o dia da semana da data selecionada
    const selectedDate = new Date(date + 'T12:00:00.000Z') // Adicionar horário para evitar problemas de timezone
    const dayOfWeek = selectedDate.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    console.log('Data selecionada:', {
      date,
      selectedDate: selectedDate.toISOString(),
      dayOfWeek,
      dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek]
    })

    // Buscar o dia de trabalho correspondente
    const workingDay = profissional.workingDays.find(day => day.dayOfWeek === dayOfWeek)

    if (!workingDay) {
      return NextResponse.json({ availableTimes: [] })
    }

    // Gerar horários disponíveis (de 30 em 30 minutos)
    const startTime = workingDay.startTime
    const endTime = workingDay.endTime
    
    const timeSlots = generateTimeSlots(startTime, endTime)

    // Buscar agendamentos já marcados para esta data e profissional
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        profissionalId,
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z')
        },
        status: {
          not: AppointmentStatus.CANCELADO
        }
      },
      select: {
        time: true
      }
    })

    const bookedTimes = existingAppointments.map(apt => apt.time)
    const availableTimes = timeSlots.filter(time => !bookedTimes.includes(time))

    console.log('API - Horários disponíveis:', {
      profissionalId,
      date,
      dayOfWeek,
      workingDay: workingDay ? { startTime: workingDay.startTime, endTime: workingDay.endTime } : null,
      timeSlots,
      bookedTimes,
      availableTimes
    })

    return NextResponse.json({ availableTimes })
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    // Adicionar 30 minutos
    currentMinute += 30
    if (currentMinute >= 60) {
      currentMinute -= 60
      currentHour += 1
    }
  }
  
  return slots
}