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

  private createAppointmentMessage(data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    clinicName: string;
  }): string {
    const formattedDate = new Date(data.date).toLocaleDateString('pt-BR');
    
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
      if (!this.baseUrl || !this.instanceName || !this.apiKey) {
        console.warn('EvolutionAPI não configurada. Variáveis de ambiente necessárias: EVOLUTION_API_URL, EVOLUTION_API_INSTANCE, EVOLUTION_API_KEY');
        return { success: false, error: 'EvolutionAPI não configurada' };
      }

      if (!data.patientPhone) {
        console.warn('Telefone do paciente não informado');
        return { success: false, error: 'Telefone do paciente não informado' };
      }

      const formattedPhone = this.formatPhoneNumber(data.patientPhone);
      const message = this.createAppointmentMessage(data);

      const response = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao enviar mensagem WhatsApp:', errorData);
        return { success: false, error: `Erro HTTP: ${response.status}` };
      }

      const result = await response.json();
      console.log('Mensagem WhatsApp enviada com sucesso:', result);
      
      return { success: true, message: 'Notificação enviada com sucesso' };
    } catch (error) {
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
      const formattedDate = new Date(data.date).toLocaleDateString('pt-BR');
      
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