import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/lib/whatsapp-service';
import { AppointmentStatus } from '@prisma/client';

interface WhatsAppWebhookData {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: {
      buttonsResponseMessage?: {
        selectedButtonId: string;
        selectedDisplayText: string;
      };
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    pushName: string;
    messageTimestamp: number;
    selectedButtonId?: string; // Para botões diretos
  };
}

// Adicionar log mais detalhado no início do webhook
export async function POST(request: Request) {
  try {
    const body = await request.text();
    
    // Log de entrada com timestamp
    console.log('\n=== WEBHOOK RECEBIDO ===');
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('📦 Body bruto:', body);
    console.log('📏 Tamanho do body:', body.length);
    
    if (!body || body.trim() === '') {
      console.log('❌ BODY VAZIO - Ignorando webhook');
      return NextResponse.json({ success: true, message: 'Body vazio ignorado' });
    }
    
    let data: WhatsAppWebhookData;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.log('❌ ERRO AO PARSEAR JSON:', parseError);
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }
    
    console.log('📋 Data parseado:', JSON.stringify(data, null, 2));
    console.log('🔍 Event type:', data.event);
    console.log('🔍 Instance:', data.instance);
    
    // Verificar se é uma mensagem válida
    if (!data.data) {
      console.log('❌ SEM DATA - Ignorando webhook');
      return NextResponse.json({ success: true, message: 'Sem data' });
    }
    
    // Log detalhado da estrutura da mensagem
    console.log('\n=== ANÁLISE DA MENSAGEM ===');
    console.log('🔍 Tem key?:', !!data.data.key);
    console.log('🔍 RemoteJid:', data.data.key?.remoteJid);
    console.log('🔍 FromMe:', data.data.key?.fromMe);
    console.log('🔍 Tem message?:', !!data.data.message);
    console.log('🔍 Tem selectedButtonId direto?:', !!data.data.selectedButtonId);
    
    if (data.data.message) {
      console.log('🔍 Tem buttonsResponseMessage?:', !!data.data.message.buttonsResponseMessage);
      console.log('🔍 Tem conversation?:', !!data.data.message.conversation);
      console.log('🔍 Tem extendedTextMessage?:', !!data.data.message.extendedTextMessage);
      
      if (data.data.message.conversation) {
        console.log('💬 Conversation:', data.data.message.conversation);
      }
      
      if (data.data.message.extendedTextMessage) {
        console.log('💬 ExtendedText:', data.data.message.extendedTextMessage.text);
      }
      
      if (data.data.message.buttonsResponseMessage) {
        console.log('🔘 ButtonResponse:', data.data.message.buttonsResponseMessage);
      }
    }
    
    // Verificar se a mensagem é do bot (fromMe: true) - IGNORAR SEMPRE
    if (data.data.key?.fromMe) {
      console.log('🤖 MENSAGEM DO BOT - Ignorando para evitar loop');
      return NextResponse.json({ success: true, message: 'Mensagem do bot ignorada' });
    }
    
    // Processar resposta de botão (formato direto)
    if (data.data?.selectedButtonId) {
      const buttonId = data.data.selectedButtonId;
      const phone = data.data.key?.remoteJid?.replace('@s.whatsapp.net', '');
      
      console.log('\n=== PROCESSANDO BOTÃO DIRETO ===');
      console.log('🔘 ButtonId:', buttonId);
      console.log('📱 Phone:', phone);
      
      return await processButtonResponse(buttonId, phone);
    }
    
    // Processar resposta de botão (formato aninhado)
    if (data.data?.message?.buttonsResponseMessage?.selectedButtonId) {
      const buttonId = data.data.message.buttonsResponseMessage.selectedButtonId;
      const phone = data.data.key?.remoteJid?.replace('@s.whatsapp.net', '');
      
      console.log('\n=== PROCESSANDO BOTÃO ANINHADO ===');
      console.log('🔘 ButtonId:', buttonId);
      console.log('📱 Phone:', phone);
      
      return await processButtonResponse(buttonId, phone);
    }
    
    // Processar resposta de texto
    if (data.data?.message?.conversation || data.data?.message?.extendedTextMessage?.text) {
      const messageText = (data.data.message?.conversation || data.data.message?.extendedTextMessage?.text || '');
      const phone = data.data.key?.remoteJid?.replace('@s.whatsapp.net', '');
      
      console.log('\n=== PROCESSANDO TEXTO ===');
      console.log('💬 Texto original:', messageText);
      console.log('💬 Texto upper:', messageText.toUpperCase());
      console.log('📱 Phone:', phone);
      console.log('🔍 Contém CONFIRMAR?:', messageText.toUpperCase().includes('CONFIRMAR'));
      console.log('🔍 Contém CANCELAR?:', messageText.toUpperCase().includes('CANCELAR'));
      
      // Verificar se é uma mensagem válida do usuário
      if (!messageText || messageText.trim() === '') {
        console.log('❌ TEXTO VAZIO - Ignorando');
        return NextResponse.json({ success: true, message: 'Texto vazio ignorado' });
      }
      
      // Verificar se é uma mensagem de sistema ou automática
      const systemMessages = [
        'mensagem apagada',
        'message deleted',
        'esta mensagem foi apagada',
        'this message was deleted'
      ];
      
      const isSystemMessage = systemMessages.some(msg => 
        messageText.toLowerCase().includes(msg.toLowerCase())
      );
      
      if (isSystemMessage) {
        console.log('🤖 MENSAGEM DE SISTEMA - Ignorando');
        return NextResponse.json({ success: true, message: 'Mensagem de sistema ignorada' });
      }
      
      if (messageText.toUpperCase().includes('CONFIRMAR')) {
        console.log('✅ CONFIRMAÇÃO DETECTADA - Processando');
        console.log('🔄 Chamando processTextResponse com CONFIRMAR...');
        const result = await processTextResponse('CONFIRMAR', phone);
        console.log('📤 Resultado de processTextResponse:', result);
        return result;
      } else if (messageText.toUpperCase().includes('CANCELAR')) {
        console.log('❌ CANCELAMENTO DETECTADO - Processando');
        console.log('🔄 Chamando processTextResponse com CANCELAR...');
        const result = await processTextResponse('CANCELAR', phone);
        console.log('📤 Resultado de processTextResponse:', result);
        return result;
      } else {
        console.log('ℹ️ TEXTO NÃO RECONHECIDO - Ignorando');
        console.log('📝 Texto recebido:', messageText);
        console.log('📝 Texto em maiúsculas:', messageText.toUpperCase());
      }
    }
    
    console.log('\n=== WEBHOOK FINALIZADO SEM AÇÃO ===');
    return NextResponse.json({ success: true, message: 'Webhook processado sem ação' });
    
  } catch (error) {
    console.error('\n=== ERRO NO WEBHOOK ===');
    console.error('❌ Erro:', error);
    console.error('📊 Stack:', error instanceof Error ? error.stack : 'Stack não disponível');
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function processButtonResponse(buttonId: string, phone: string) {
  try {
    console.log('🔘 Processando resposta de botão:', { buttonId, phone });
    
    if (!buttonId || !phone) {
      console.error('❌ ButtonId ou phone não fornecidos');
      return NextResponse.json({ success: false, error: 'Dados incompletos' });
    }

    // Extrair ação e ID do agendamento do buttonId
    // Formato esperado: "confirm_appointmentId" ou "cancel_appointmentId"
    const [action, appointmentId] = buttonId.split('_');
    
    console.log('📋 Dados extraídos:', { action, appointmentId });
    
    if (!action || !appointmentId) {
      console.error('❌ Formato de buttonId inválido:', buttonId);
      return NextResponse.json({ success: false, error: 'Formato de botão inválido' });
    }

    // Buscar o agendamento
    console.log('🔍 Buscando agendamento:', appointmentId);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        profissional: true,
        clinic: true
      }
    });

    if (!appointment) {
      console.error('❌ Agendamento não encontrado:', appointmentId);
      return NextResponse.json({ success: false, error: 'Agendamento não encontrado' });
    }

    console.log('📱 Agendamento encontrado:', {
      id: appointment.id,
      patientName: appointment.patient.name,
      patientPhone: appointment.patient.phone,
      currentStatus: appointment.status
    });

    // Verificar se o telefone corresponde ao paciente
    const patientPhone = appointment.patient.phone?.replace(/\D/g, '') || '';
    const webhookPhone = phone.replace(/\D/g, '');
    
    // Normalizar telefones para comparação (remover código do país se presente)
    const normalizePhone = (phoneNumber: string) => {
      // Remove todos os caracteres não numéricos
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Se o telefone tem 13 dígitos e começa com 55 (Brasil), remove o código do país
      if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
        return cleanPhone.substring(2);
      }
      
      // Se o telefone tem 12 dígitos e começa com 55 (Brasil), remove o código do país
      if (cleanPhone.length === 12 && cleanPhone.startsWith('55')) {
        return cleanPhone.substring(2);
      }
      
      return cleanPhone;
    };
    
    const normalizedPatientPhone = normalizePhone(patientPhone);
    const normalizedWebhookPhone = normalizePhone(webhookPhone);
    
    console.log('📞 Comparando telefones:', {
      patientPhone,
      webhookPhone,
      normalizedPatientPhone,
      normalizedWebhookPhone,
      match: normalizedPatientPhone === normalizedWebhookPhone
    });
    
    if (normalizedPatientPhone !== normalizedWebhookPhone) {
      console.error('❌ Telefone não corresponde ao paciente:', {
        expected: normalizedPatientPhone,
        received: normalizedWebhookPhone
      });
      return NextResponse.json({ success: false, error: 'Telefone não autorizado' });
    }

    // Atualizar status do agendamento
    const newStatus = action === 'confirm' ? AppointmentStatus.CONFIRMADO : AppointmentStatus.CANCELADO;
    
    console.log('🔄 Atualizando status:', {
      appointmentId,
      oldStatus: appointment.status,
      newStatus
    });
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus }
    });
    
    console.log('✅ Status atualizado com sucesso:', {
      appointmentId,
      newStatus: updatedAppointment.status
    });

    // Enviar mensagem de confirmação
    const confirmationMessage = action === 'confirm' 
      ? `✅ *Consulta Confirmada!*\n\nSua consulta foi confirmada com sucesso.\n\nNos vemos em breve! 😊`
      : `❌ *Consulta Cancelada*\n\nSua consulta foi cancelada.\n\nPara reagendar, entre em contato conosco.`;
      
    await whatsappService.sendAppointmentNotification({
      patientPhone: phone,
      patientName: appointment.patient.name,
      doctorName: '',
      date: '',
      time: '',
      clinicName: confirmationMessage
    });

    return NextResponse.json({ 
      success: true, 
      message: `Agendamento ${action === 'confirm' ? 'confirmado' : 'cancelado'} com sucesso`,
      appointmentId,
      newStatus
    });
    
  } catch (error) {
    console.error('💥 Erro ao processar resposta de botão:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}

// Remover completamente a função processButtonResponse

async function processTextResponse(action: string, phone: string) {
  try {
    console.log('\n=== PROCESSANDO RESPOSTA DE TEXTO ===');
    console.log('🔄 Action:', action);
    console.log('📱 Phone:', phone);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    if (!action || !phone) {
      console.error('❌ Action ou phone não fornecidos');
      return NextResponse.json({ success: false, error: 'Dados incompletos' });
    }

    // Normalizar telefone
    const normalizePhone = (phoneNumber: string) => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
        return cleanPhone.substring(2);
      }
      if (cleanPhone.length === 12 && cleanPhone.startsWith('55')) {
        return cleanPhone.substring(2);
      }
      return cleanPhone;
    };
    
    const normalizedPhone = normalizePhone(phone);
    console.log('📞 Telefone normalizado:', normalizedPhone);
    
    // Buscar agendamento pelo telefone
    console.log('🔍 Buscando agendamento...');
    const appointment = await prisma.appointment.findFirst({
      where: {
        patient: {
          phone: {
            contains: normalizedPhone
          }
        },
        status: {
          in: [AppointmentStatus.AGENDADO] // Removendo PENDENTE que não existe
        }
      },
      include: {
        patient: true,
        profissional: true,
        clinic: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    if (!appointment) {
      console.error('❌ Agendamento não encontrado para telefone:', normalizedPhone);
      
      // Log de todos os agendamentos para debug
      const allAppointments = await prisma.appointment.findMany({
        where: { status: AppointmentStatus.AGENDADO },
        include: { patient: true }
      });
      
      console.log('📋 Agendamentos disponíveis:');
      allAppointments.forEach(apt => {
        console.log(`  - ID: ${apt.id}, Paciente: ${apt.patient.name}, Telefone: ${apt.patient.phone}`);
      });
      
      return NextResponse.json({ success: false, error: 'Agendamento não encontrado' });
    }

    console.log('📋 Agendamento encontrado:', {
      id: appointment.id,
      patientName: appointment.patient.name,
      patientPhone: appointment.patient.phone,
      currentStatus: appointment.status,
      date: appointment.date
    });

    // Verificar se o telefone corresponde
    const patientPhone = appointment.patient.phone?.replace(/\D/g, '') || '';
    const normalizedPatientPhone = normalizePhone(patientPhone);
    
    console.log('📞 Comparando telefones:', {
      webhookPhone: normalizedPhone,
      patientPhone: normalizedPatientPhone,
      match: normalizedPatientPhone === normalizedPhone
    });
    
    if (normalizedPatientPhone !== normalizedPhone) {
      console.error('❌ Telefone não corresponde ao paciente');
      return NextResponse.json({ success: false, error: 'Telefone não autorizado' });
    }

    // Atualizar status
    const newStatus = action === 'CONFIRMAR' ? AppointmentStatus.CONFIRMADO : AppointmentStatus.CANCELADO;
    
    console.log('🔄 Atualizando status:', {
      appointmentId: appointment.id,
      oldStatus: appointment.status,
      newStatus,
      action
    });
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: newStatus }
    });
    
    console.log('✅ Status atualizado com sucesso:', {
      appointmentId: appointment.id,
      newStatus: updatedAppointment.status
    });

    
      
    console.log('📤 Enviando mensagem de confirmação...');
    
    // Definir a mensagem de confirmação baseada no status
    const confirmationMessage = newStatus === AppointmentStatus.CONFIRMADO 
      ? `✅ Agendamento confirmado com sucesso!\n\n📅 Data: ${appointment.date.toLocaleDateString('pt-BR')}\n🕐 Horário: ${appointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n👨‍⚕️ Profissional: ${appointment.profissional.name}\n\nObrigado por confirmar!`
      : `❌ Agendamento cancelado.\n\n📅 Data: ${appointment.date.toLocaleDateString('pt-BR')}\n🕐 Horário: ${appointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\nSe precisar reagendar, entre em contato conosco.`;

    // Enviar mensagem de confirmação
    const messageResult = await whatsappService.sendSimpleMessage(
      `${phone}@s.whatsapp.net`, 
      confirmationMessage
    );
    
    console.log('📱 Resultado do envio:', messageResult);
    
    if (!messageResult.success) {
      console.error('❌ Falha ao enviar mensagem:', messageResult.error);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('\n=== ERRO EM processTextResponse ===');
    console.error('❌ Erro:', error);
    console.error('📊 Stack:', error instanceof Error ? error.stack : 'Stack não disponível');
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Método GET para verificação do webhook
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook ativo',
    description: 'Processa confirmações de agendamento via WhatsApp'
  });
}