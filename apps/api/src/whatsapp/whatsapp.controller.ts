import { Controller, Post, Get, Body, Query, HttpCode, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Public } from '../common/decorators/roles.decorator';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

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
   * Handle Inbound Messages & Status Updates from Meta
   */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessage(@Body() body: any) {
    // Meta requires an immediate 200 OK response to webhooks
    if (body.object === 'whatsapp_business_account') {
      try {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            
            // Handle Message Status Updates (Sent, Delivered, Read)
            if (value.statuses) {
              for (const status of value.statuses) {
                await this.whatsappService.handleMessageStatusUpdate(status.id, status.status);
              }
            }

            // Handle Incoming Messages
            if (value.messages) {
              for (const message of value.messages) {
                // Here we would route to an AI bot or manual inbox
                await this.whatsappService.handleIncomingMessage(message.from, message.text?.body, message.id);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to process WhatsApp Webhook', e);
      }
    }
    
    return 'EVENT_RECEIVED';
  }
}
