import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface WhatsAppConfig {
  provider: 'inboxwa' | 'meta';
  inboxwaApiKey: string;
  inboxwaInstanceId: string;
  inboxwaBaseUrl: string;
  inboxwaPhoneNumber: string;
  autoReplyEnabled: boolean;
  phoneNumberId?: string;
  accessToken?: string;
}

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  
  private provider: 'inboxwa' | 'meta';
  
  // InboxWA Configuration
  private inboxwaApiKey: string;
  private inboxwaInstanceId: string;
  private inboxwaBaseUrl: string;
  private inboxwaPhoneNumber: string;
  private autoReplyEnabled: boolean;

  // Meta Cloud API Configuration
  private phoneNumberId: string;
  private accessToken: string;
  private metaApiUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.provider = (this.configService.get<string>('WHATSAPP_PROVIDER', 'inboxwa').toLowerCase() as 'inboxwa' | 'meta') || 'inboxwa';
    
    // InboxWA config
    this.inboxwaApiKey = this.configService.get<string>('INBOXWA_API_KEY', '');
    this.inboxwaInstanceId = this.configService.get<string>('INBOXWA_INSTANCE_ID', '');
    this.inboxwaBaseUrl = this.configService.get<string>('INBOXWA_BASE_URL', 'https://inboxwa.online/api/v1');
    this.inboxwaPhoneNumber = this.configService.get<string>('INBOXWA_PHONE_NUMBER', '919876543210');
    this.autoReplyEnabled = true;

    // Meta config
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.metaApiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
  }

  /**
   * Load saved WhatsApp settings from database on startup
   */
  async onModuleInit() {
    try {
      const savedConfig = await this.prisma.systemConfig.findUnique({
        where: { key: 'WHATSAPP_CONFIG' },
      });

      if (savedConfig && savedConfig.value) {
        const parsed = JSON.parse(savedConfig.value);
        if (parsed.provider) this.provider = parsed.provider;
        if (parsed.inboxwaApiKey) this.inboxwaApiKey = parsed.inboxwaApiKey;
        if (parsed.inboxwaInstanceId) this.inboxwaInstanceId = parsed.inboxwaInstanceId;
        if (parsed.inboxwaBaseUrl) this.inboxwaBaseUrl = parsed.inboxwaBaseUrl;
        if (parsed.inboxwaPhoneNumber) this.inboxwaPhoneNumber = parsed.inboxwaPhoneNumber;
        if (parsed.autoReplyEnabled !== undefined) this.autoReplyEnabled = parsed.autoReplyEnabled;
        if (parsed.phoneNumberId) {
          this.phoneNumberId = parsed.phoneNumberId;
          this.metaApiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
        }
        if (parsed.accessToken) this.accessToken = parsed.accessToken;

        this.logger.log('Loaded WhatsApp configuration from database successfully.');
      }
    } catch (e) {
      this.logger.error('Failed to load WhatsApp configuration from database', e);
    }
  }

  /**
   * Super Admin only: Get current WhatsApp configuration
   */
  getConfig(): WhatsAppConfig {
    return {
      provider: this.provider,
      inboxwaApiKey: this.inboxwaApiKey,
      inboxwaInstanceId: this.inboxwaInstanceId,
      inboxwaBaseUrl: this.inboxwaBaseUrl,
      inboxwaPhoneNumber: this.inboxwaPhoneNumber,
      autoReplyEnabled: this.autoReplyEnabled,
      phoneNumberId: this.phoneNumberId,
      accessToken: this.accessToken ? '••••••••' + this.accessToken.slice(-4) : '',
    };
  }

  /**
   * Super Admin only: Update WhatsApp settings dynamically & persist to database
   */
  async updateConfig(config: Partial<WhatsAppConfig>): Promise<WhatsAppConfig> {
    if (config.provider) this.provider = config.provider;
    if (config.inboxwaApiKey !== undefined) this.inboxwaApiKey = config.inboxwaApiKey;
    if (config.inboxwaInstanceId !== undefined) this.inboxwaInstanceId = config.inboxwaInstanceId;
    if (config.inboxwaBaseUrl !== undefined) this.inboxwaBaseUrl = config.inboxwaBaseUrl;
    if (config.inboxwaPhoneNumber !== undefined) this.inboxwaPhoneNumber = config.inboxwaPhoneNumber;
    if (config.autoReplyEnabled !== undefined) this.autoReplyEnabled = config.autoReplyEnabled;
    if (config.phoneNumberId !== undefined) {
      this.phoneNumberId = config.phoneNumberId;
      this.metaApiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
    }
    if (config.accessToken !== undefined && !config.accessToken.includes('••••')) {
      this.accessToken = config.accessToken;
    }

    // Persist to database
    try {
      const fullConfigToSave = {
        provider: this.provider,
        inboxwaApiKey: this.inboxwaApiKey,
        inboxwaInstanceId: this.inboxwaInstanceId,
        inboxwaBaseUrl: this.inboxwaBaseUrl,
        inboxwaPhoneNumber: this.inboxwaPhoneNumber,
        autoReplyEnabled: this.autoReplyEnabled,
        phoneNumberId: this.phoneNumberId,
        accessToken: this.accessToken,
      };

      await this.prisma.systemConfig.upsert({
        where: { key: 'WHATSAPP_CONFIG' },
        update: {
          value: JSON.stringify(fullConfigToSave),
          type: 'json',
        },
        create: {
          key: 'WHATSAPP_CONFIG',
          value: JSON.stringify(fullConfigToSave),
          type: 'json',
        },
      });

      this.logger.log(`Super Admin updated & persisted WhatsApp configuration to DB: Provider=${this.provider}, Instance=${this.inboxwaInstanceId}`);
    } catch (err) {
      this.logger.error('Failed to persist WhatsApp config to database', err);
    }

    return this.getConfig();
  }

  /**
   * Send a text message via WhatsApp (InboxWA gateway or Meta Cloud API)
   */
  async sendMessage(to: string, message: string, userId?: string): Promise<boolean> {
    const cleanPhone = to.replace(/[^0-9]/g, '');

    if (this.provider === 'inboxwa') {
      return this.sendViaInboxWA(cleanPhone, message, userId);
    } else {
      return this.sendViaMeta(cleanPhone, message, userId);
    }
  }

  /**
   * Send a WhatsApp message via InboxWA (https://inboxwa.online)
   */
  private async sendViaInboxWA(to: string, message: string, userId?: string): Promise<boolean> {
    try {
      const url = `${this.inboxwaBaseUrl}/send-text`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.inboxwaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instance_id: this.inboxwaInstanceId,
          number: to,
          message: message,
        }),
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        this.logger.error(`Failed to send InboxWA message: ${JSON.stringify(data)}`);
        await this.logMessage({
          phone: to,
          content: message,
          direction: 'OUTBOUND',
          provider: 'INBOXWA',
          status: 'FAILED',
          error: JSON.stringify(data),
          userId,
        });
        return false;
      }

      const messageId = data?.message_id || data?.id || `inboxwa_${Date.now()}`;
      this.logger.log(`InboxWA message sent successfully to ${to} (ID: ${messageId})`);

      await this.logMessage({
        phone: to,
        messageId,
        content: message,
        direction: 'OUTBOUND',
        provider: 'INBOXWA',
        status: 'SENT',
        userId,
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Exception while sending InboxWA message: ${error.message}`);
      await this.logMessage({
        phone: to,
        content: message,
        direction: 'OUTBOUND',
        provider: 'INBOXWA',
        status: 'FAILED',
        error: error.message,
        userId,
      });
      return false;
    }
  }

  /**
   * Send a WhatsApp message via Meta Cloud API
   */
  private async sendViaMeta(to: string, message: string, userId?: string): Promise<boolean> {
    try {
      const response = await fetch(this.metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        this.logger.error(`Failed to send Meta WhatsApp message: ${JSON.stringify(data)}`);
        await this.logMessage({
          phone: to,
          content: message,
          direction: 'OUTBOUND',
          provider: 'META',
          status: 'FAILED',
          error: JSON.stringify(data),
          userId,
        });
        return false;
      }

      const messageId = data?.messages?.[0]?.id;
      this.logger.log(`Meta WhatsApp message sent successfully to ${to} (ID: ${messageId})`);

      await this.logMessage({
        phone: to,
        messageId,
        content: message,
        direction: 'OUTBOUND',
        provider: 'META',
        status: 'SENT',
        userId,
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Exception while sending Meta WhatsApp message: ${error.message}`);
      return false;
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode = 'en_US'): Promise<boolean> {
    const cleanPhone = to.replace(/[^0-9]/g, '');

    if (this.provider === 'inboxwa') {
      const templateText = `[${templateName}] Thank you for choosing MP Production. We have updated your account/booking.`;
      return this.sendMessage(cleanPhone, templateText);
    }

    try {
      const response = await fetch(this.metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
          },
        }),
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        this.logger.error(`Failed to send Meta WhatsApp template: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log(`WhatsApp template '${templateName}' sent to ${cleanPhone}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Exception while sending WhatsApp template: ${error.message}`);
      return false;
    }
  }

  /**
   * Process InboxWA Webhooks for inbound customer messages
   */
  async handleInboxWAWebhook(payload: any) {
    this.logger.log(`InboxWA Webhook Received: ${JSON.stringify(payload)}`);

    const fromPhone = payload.phone || payload.sender || payload.number;
    const messageContent = payload.message || payload.text || payload.body;
    const messageId = payload.message_id || payload.id || `inboxwa_in_${Date.now()}`;
    const status = payload.status;

    if (status && messageId) {
      await this.handleMessageStatusUpdate(messageId, status);
    }

    if (fromPhone && messageContent) {
      await this.logMessage({
        phone: fromPhone,
        messageId,
        content: messageContent,
        direction: 'INBOUND',
        provider: 'INBOXWA',
        status: 'DELIVERED',
      });

      if (this.autoReplyEnabled) {
        await this.handleIncomingMessage(fromPhone, messageContent, messageId);
      }
    }
  }

  /**
   * Handle Inbound Auto-Reply logic
   */
  async handleIncomingMessage(fromPhone: string, text: string, messageId: string) {
    this.logger.log(`Incoming WhatsApp message from ${fromPhone}: ${text}`);

    const autoReplyText = `Hi! Thanks for reaching out to MP Production on WhatsApp. 🎬\n\nWe have received your query: "${text.substring(0, 50)}..."\n\nOur team is working on your request and will connect with you shortly. You can also view active projects at https://mpproduction.com/client-portal`;

    await this.sendMessage(fromPhone, autoReplyText);
  }

  /**
   * Handle delivery/read status updates
   */
  async handleMessageStatusUpdate(messageId: string, status: string) {
    this.logger.log(`WhatsApp message ${messageId} status updated to: ${status}`);
    
    try {
      await this.prisma.whatsAppLog.updateMany({
        where: { messageId },
        data: {
          status: status.toUpperCase(),
          ...(status.toLowerCase() === 'delivered' ? { deliveredAt: new Date() } : {}),
          ...(status.toLowerCase() === 'read' ? { readAt: new Date() } : {}),
        }
      });
    } catch (e) {
      this.logger.error(`Failed to update WhatsApp log status for ${messageId}`, e);
    }
  }

  /**
   * Helper to write logs to Prisma WhatsAppLog table
   */
  private async logMessage(params: {
    phone: string;
    messageId?: string;
    content: string;
    direction: string;
    provider: string;
    status: string;
    error?: string;
    userId?: string;
  }) {
    try {
      await this.prisma.whatsAppLog.create({
        data: {
          phone: params.phone,
          recipientPhone: params.phone,
          messageId: params.messageId,
          content: params.content,
          direction: params.direction,
          provider: params.provider,
          status: params.status,
          error: params.error,
          userId: params.userId,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to save WhatsAppLog to database: ${err}`);
    }
  }
}


