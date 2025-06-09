import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PatientStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar o usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 400 })
    }

    // Buscar parâmetros de pesquisa
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Buscar pacientes da clínica
    const patients = await prisma.patient.findMany({
      where: {
        clinicId: user.clinicId,
        OR: search ? [
          { name: { contains: search } },
          { email: { contains: search } },
          { cpf: { contains: search } }
        ] : undefined
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar o usuário e sua clínica
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, cpf, phone, address, status, lastConsult } = body

    // Validações básicas
    if (!name || !cpf) {
      return NextResponse.json({ error: 'Name and CPF are required' }, { status: 400 })
    }

    // Verificar se CPF já existe
    const existingPatient = await prisma.patient.findUnique({
      where: { cpf }
    })

    if (existingPatient) {
      return NextResponse.json({ error: 'Patient with this CPF already exists' }, { status: 400 })
    }

    // Criar paciente
    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        cpf,
        phone,
        address,
        status: status || PatientStatus.AGENDADO,
        lastConsult: lastConsult ? new Date(lastConsult) : null,
        clinicId: user.clinicId
      }
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}