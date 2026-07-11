import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', '1238422812683084');
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', 'EAAn78WMjfUEBR819nCliZBdToiUtZAk5ZBLYOwsvOcmVZAV28ZCJnC42HoYvmTZANoyw5AIGsXZA');
    this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''), // Ensure the number contains only digits
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Failed to send WhatsApp message: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log(`WhatsApp message sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Exception while sending WhatsApp message: ${error.message}`);
      return false;
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode = 'en_US'): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Failed to send WhatsApp template: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log(`WhatsApp template '${templateName}' sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Exception while sending WhatsApp template: ${error.message}`);
      return false;
    }
  }

  async handleMessageStatusUpdate(messageId: string, status: string) {
    this.logger.log(`Message ${messageId} updated to status: ${status}`);
    
    try {
      await this.prisma.whatsAppLog.updateMany({
        where: { messageId },
        data: {
          status,
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
          ...(status === 'read' ? { readAt: new Date() } : {}),
        }
      });
    } catch (e) {
      this.logger.error(`Failed to update message status for ${messageId}`, e);
    }
  }

  async handleIncomingMessage(fromPhone: string, text: string, messageId: string) {
    this.logger.log(`Incoming message from ${fromPhone}: ${text}`);
    
    // Auto-responder logic for MVP
    // In production, this would route to a Dialogflow/OpenAI bot or an internal inbox.
    const autoReplyText = `Hi! Thanks for reaching out to MP Production. We've received your message and our team will get back to you shortly. \n\nIf this is urgent, please call our support line.`;
    
    await this.sendMessage(fromPhone, autoReplyText);
  }
}
