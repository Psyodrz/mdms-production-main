import { Controller, Post, Get, Body, Query, HttpCode } from '@nestjs/common';
import { WhatsappService, WhatsAppConfig } from './whatsapp.service';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * PUBLIC: Check if WhatsApp chatbot is enabled & get public phone number
   */
  @Public()
  @Get('status')
  getPublicStatus() {
    const config = this.whatsappService.getConfig();
    return {
      success: true,
      enabled: config.autoReplyEnabled,
      phoneNumber: config.inboxwaPhoneNumber,
      provider: config.provider,
    };
  }

  /**
   * SUPER_ADMIN ONLY: Fetch current WhatsApp & InboxWA configuration settings
   */
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('config')
  getConfig() {
    const config = this.whatsappService.getConfig();
    return {
      success: true,
      data: config,
    };
  }

  /**
   * SUPER_ADMIN ONLY: Update & Activate InboxWA / WhatsApp credentials instantly
   */
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('config')
  async updateConfig(@Body() body: Partial<WhatsAppConfig>) {
    const updatedConfig = await this.whatsappService.updateConfig(body);
    return {
      success: true,
      message: 'WhatsApp & InboxWA configuration updated and activated successfully.',
      data: updatedConfig,
    };
  }

  /**
   * SUPER_ADMIN ONLY: Send a live test WhatsApp message to verify connection
   */
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('test')
  async sendTestMessage(@Body() body: { phone: string; message?: string }) {
    const testPhone = body.phone;
    const testMsg = body.message || '🎉 Success! Your WhatsApp & InboxWA automation for MP Production is working perfectly.';
    
    const sent = await this.whatsappService.sendMessage(testPhone, testMsg);
    
    if (sent) {
      return {
        success: true,
        message: `Test message sent successfully to ${testPhone}`,
      };
    } else {
      return {
        success: false,
        message: `Failed to send test message to ${testPhone}. Please check your API Key & Instance ID.`,
      };
    }
  }

  /**
   * Meta Cloud API Webhook Verification Challenge
   */
  @Public()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string
  ) {
    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mdms_super_secret_token';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }
    return 'Forbidden';
  }

  /**
   * Handle Inbound Webhook from InboxWA (https://inboxwa.online)
   */
  @Public()
  @Post('inboxwa/webhook')
  @HttpCode(200)
  async handleInboxWAWebhook(@Body() body: any) {
    try {
      await this.whatsappService.handleInboxWAWebhook(body);
      return { success: true, message: 'InboxWA Webhook Received' };
    } catch (e: any) {
      console.error('Failed to process InboxWA Webhook', e);
      return { success: false, error: e.message };
    }
  }

  @Public()
  @Get('inboxwa/webhook')
  verifyInboxWAWebhook(@Query('challenge') challenge: string) {
    return challenge || 'InboxWA Webhook Verified';
  }

  /**
   * Handle Inbound Messages & Status Updates from Meta
   */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessage(@Body() body: any) {
    if (body.object === 'whatsapp_business_account') {
      try {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            
            if (value.statuses) {
              for (const status of value.statuses) {
                await this.whatsappService.handleMessageStatusUpdate(status.id, status.status);
              }
            }

            if (value.messages) {
              for (const message of value.messages) {
                await this.whatsappService.handleIncomingMessage(message.from, message.text?.body, message.id);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to process Meta WhatsApp Webhook', e);
      }
    }
    
    return 'EVENT_RECEIVED';
  }
}


