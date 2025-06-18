interface WhatsAppMessage {
  number: string;
  text: string;
}

interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class WhatsAppService {
  private baseUrl: string;
  private instanceName: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || '';
    this.instanceName = process.env.EVOLUTION_API_INSTANCE || '';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
    
    // Debug das variáveis de ambiente
    console.log('🔧 WhatsApp Service - Configurações:');
    console.log('🌐 Base URL:', this.baseUrl || 'NÃO DEFINIDA');
    console.log('🏷️ Instance:', this.instanceName || 'NÃO DEFINIDA');
    console.log('🔑 API Key:', this.apiKey ? '***DEFINIDA***' : 'NÃO DEFINIDA');
  }

  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  // Função utilitária para formatar data de forma segura
  private formatDateSafely(dateString: string): string {
    try {
      console.log('📅 Data original recebida:', dateString);
      
      // Remove qualquer informação de horário e força interpretação como data local
      const dateOnly = dateString.split('T')[0]; // Pega apenas YYYY-MM-DD
      console.log('📅 Data limpa:', dateOnly);
      
      // Divide a data em partes
      const [year, month, day] = dateOnly.split('-').map(Number);
      console.log('📅 Partes da data:', { year, month, day });
      
      // Cria a data usando o construtor que não sofre com fuso horário
      // Mês é 0-indexado no JavaScript, por isso month - 1
      const date = new Date(year, month - 1, day);
      console.log('📅 Data criada:', date);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.error('❌ Data inválida criada');
        return dateString;
      }
      
      const formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      console.log('📅 Data formatada final:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error);
      return dateString; // Retorna a string original em caso de erro
    }
  }

  private createAppointmentMessage(data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    clinicName: string;
  }): string {
    const formattedDate = this.formatDateSafely(data.date);
    
    return `🏥 *Agendamento Confirmado*\n\n` +
           `Olá *${data.patientName}*!\n\n` +
           `Seu agendamento foi confirmado com sucesso:\n\n` +
           `👨‍⚕️ *Profissional:* ${data.doctorName}\n` +
           `📅 *Data:* ${formattedDate}\n` +
           `🕐 *Horário:* ${data.time}\n` +
           `🏥 *Clínica:* ${data.clinicName}\n\n` +
           `⚠️ *Importante:*\n` +
           `• Chegue 15 minutos antes do horário\n` +
           `• Traga seus documentos e exames\n` +
           `• Em caso de cancelamento, avise com antecedência\n\n` +
           `Qualquer dúvida, entre em contato conosco.\n\n` +
           `Obrigado! 😊`;
  }

  async sendAppointmentNotification(data: {
    patientPhone: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    clinicName: string;
  }): Promise<EvolutionAPIResponse> {
    try {
      console.log('🚀 Iniciando envio de notificação WhatsApp...');
      
      if (!this.baseUrl || !this.instanceName || !this.apiKey) {
        const missingVars = [];
        if (!this.baseUrl) missingVars.push('EVOLUTION_API_URL');
        if (!this.instanceName) missingVars.push('EVOLUTION_API_INSTANCE');
        if (!this.apiKey) missingVars.push('EVOLUTION_API_KEY');
        
        console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
        console.warn('EvolutionAPI não configurada. Variáveis de ambiente necessárias: EVOLUTION_API_URL, EVOLUTION_API_INSTANCE, EVOLUTION_API_KEY');
        return { success: false, error: 'EvolutionAPI não configurada' };
      }

      if (!data.patientPhone) {
        console.error('❌ Telefone do paciente não informado');
        console.warn('Telefone do paciente não informado');
        return { success: false, error: 'Telefone do paciente não informado' };
      }

      const formattedPhone = this.formatPhoneNumber(data.patientPhone);
      console.log('📱 Telefone formatado:', formattedPhone);
      
      const message = this.createAppointmentMessage(data);
      console.log('💬 Mensagem criada (primeiros 100 chars):', message.substring(0, 100) + '...');
      
      const requestUrl = `${this.baseUrl}/message/sendText/${this.instanceName}`;
      console.log('🌐 URL da requisição:', requestUrl);
      
      const requestBody = {
        number: formattedPhone,
        text: message,
      };
      console.log('📦 Corpo da requisição:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 Status da resposta:', response.status);
      console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro na resposta da API:', errorData);
        console.error('Erro ao enviar mensagem WhatsApp:', errorData);
        return { success: false, error: `Erro HTTP: ${response.status}` };
      }

      const result = await response.json();
      console.log('✅ Resposta da API (sucesso):', result);
      console.log('Mensagem WhatsApp enviada com sucesso:', result);
      
      return { success: true, message: 'Notificação enviada com sucesso' };
    } catch (error) {
      console.error('💥 Erro crítico no envio:', error);
      console.error('📊 Stack trace completo:', (error as Error).stack);
      console.error('Erro ao enviar notificação WhatsApp:', error);
      return { success: false, error: 'Erro interno ao enviar notificação' };
    }
  }

  async sendReminderNotification(data: {
    patientPhone: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    clinicName: string;
  }): Promise<EvolutionAPIResponse> {
    try {
      if (!this.baseUrl || !this.instanceName || !this.apiKey) {
        return { success: false, error: 'EvolutionAPI não configurada' };
      }

      if (!data.patientPhone) {
        return { success: false, error: 'Telefone do paciente não informado' };
      }

      const formattedPhone = this.formatPhoneNumber(data.patientPhone);
      const formattedDate = this.formatDateSafely(data.date);
      
      const reminderMessage = `🔔 *Lembrete de Consulta*\n\n` +
                             `Olá *${data.patientName}*!\n\n` +
                             `Lembramos que você tem uma consulta agendada:\n\n` +
                             `👨‍⚕️ *Profissional:* ${data.doctorName}\n` +
                             `📅 *Data:* ${formattedDate}\n` +
                             `🕐 *Horário:* ${data.time}\n` +
                             `🏥 *Clínica:* ${data.clinicName}\n\n` +
                             `Nos vemos em breve! 😊`;

      const response = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: reminderMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao enviar lembrete WhatsApp:', errorData);
        return { success: false, error: `Erro HTTP: ${response.status}` };
      }

      const result = await response.json();
      console.log('Lembrete WhatsApp enviado com sucesso:', result);
      
      return { success: true, message: 'Lembrete enviado com sucesso' };
    } catch (error) {
      console.error('Erro ao enviar lembrete WhatsApp:', error);
      return { success: false, error: 'Erro interno ao enviar lembrete' };
    }
  }
}

export const whatsappService = new WhatsAppService();