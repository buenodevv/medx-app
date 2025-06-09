import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PatientStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, cpf, phone, address, status, lastConsult } = body

    // Verificar se o paciente existe e pertence à clínica
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Verificar se CPF já existe em outro paciente
    if (cpf && cpf !== existingPatient.cpf) {
      const patientWithCpf = await prisma.patient.findUnique({
        where: { cpf }
      })

      if (patientWithCpf) {
        return NextResponse.json({ error: 'Patient with this CPF already exists' }, { status: 400 })
      }
    }

    // Atualizar paciente
    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(cpf && { cpf }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
        ...(lastConsult !== undefined && { lastConsult: lastConsult ? new Date(lastConsult) : null })
      }
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clinic: true }
    })

    if (!user || !user.clinicId) {
      return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 400 })
    }

    // Verificar se o paciente existe e pertence à clínica
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Deletar paciente
    await prisma.patient.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}