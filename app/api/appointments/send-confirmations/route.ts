import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/lib/whatsapp-service';
import { AppointmentStatus } from '@prisma/client';

// Esta API será chamada por um cron job diariamente
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando processo de envio de confirmações...');
    
    // Calcular a data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    console.log('📅 Buscando agendamentos para:', tomorrow.toLocaleDateString('pt-BR'));
    console.log('🕐 Range de busca:', {
      from: tomorrow.toISOString(),
      to: dayAfterTomorrow.toISOString()
    });
    
    // Primeiro, vamos ver TODOS os agendamentos para debug
    const allAppointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        profissional: true,
        clinic: true
      }
    });
    
    console.log('📊 Total de agendamentos no banco:', allAppointments.length);
    console.log('📋 Agendamentos encontrados:', allAppointments.map(apt => ({
      id: apt.id,
      date: apt.date,
      status: apt.status,
      patient: apt.patient.name
    })));
    
    // Buscar agendamentos para amanhã que ainda estão AGENDADO
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        status: AppointmentStatus.AGENDADO
      },
      include: {
        patient: true,
        profissional: true,
        clinic: true
      }
    });
    
    console.log(`📋 Encontrados ${appointments.length} agendamentos para confirmação`);
    
    const results = [];
    
    for (const appointment of appointments) {
      if (!appointment.patient.phone) {
        console.warn(`⚠️ Paciente ${appointment.patient.name} não tem telefone cadastrado`);
        continue;
      }
      
      try {
        console.log(`📱 Enviando confirmação para ${appointment.patient.name}...`);
        
        const result = await whatsappService.sendSimpleConfirmationRequest({
          patientPhone: appointment.patient.phone,
          patientName: appointment.patient.name,
          doctorName: appointment.profissional.name,
          date: appointment.date.toISOString(),
          time: appointment.time,
          clinicName: appointment.clinic.name,
          appointmentId: appointment.id,
        });
        
        results.push({
          appointmentId: appointment.id,
          patientName: appointment.patient.name,
          success: result.success,
          error: result.error
        });
        
        if (result.success) {
          console.log(`✅ Confirmação enviada para ${appointment.patient.name}`);
        } else {
          console.error(`❌ Falha ao enviar para ${appointment.patient.name}:`, result.error);
        }
        
        // Pequena pausa entre envios para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`💥 Erro ao processar agendamento ${appointment.id}:`, error);
        results.push({
          appointmentId: appointment.id,
          patientName: appointment.patient.name,
          success: false,
          error: 'Erro interno'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Resumo: ${successCount} sucessos, ${failureCount} falhas`);
    
    return NextResponse.json({
      success: true,
      message: `Processados ${appointments.length} agendamentos`,
      summary: {
        total: appointments.length,
        sent: successCount,
        failed: failureCount
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Erro no processo de confirmações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}