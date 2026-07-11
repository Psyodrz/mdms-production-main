import { Controller, Post, Get, Body, Param, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role, PaymentType } from '@mdms/types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('checkout/session')
  async createSession(
    @Body('projectId') projectId: string,
    @Body('amount') amount: number,
    @Body('type') type: PaymentType
  ) {
    return this.paymentsService.createCheckoutSession(projectId, amount, type);
  }

  @Roles(Role.CLIENT)
  @Get('invoices')
  async getInvoices(@Req() req: any) {
    return this.paymentsService.getClientInvoices(req.user.id);
  }

  @Public()
  @Post('webhook/razorpay')
  async razorpayWebhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string
  ) {
    // rawBody is passed from middleware/request if raw body is configured
    // otherwise we fallback to req.body string/object
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = this.paymentsService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.paymentsService.handleWebhook(req.body);
    return { received: true };
  }
}
