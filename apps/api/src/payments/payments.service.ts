import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';
import { PaymentStatus, PaymentType } from '@mdms/types';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private readonly razorpay: Razorpay;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    // In production, require credentials. In dev, fallback gracefully if not set yet.
    this.razorpay = new Razorpay({
      key_id: keyId || 'mock_key_id',
      key_secret: keySecret || 'mock_key_secret',
    });
  }

  /**
   * Generates a real Razorpay checkout session and order
   */
  async createCheckoutSession(projectId: string, amountPaise: number, type: PaymentType) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // Create a real order in Razorpay
    let razorpayOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
    
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    if (keyId && keyId !== 'mock_key_id') {
      try {
        const order = await this.razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${projectId.slice(0, 8)}_${Date.now()}`,
        });
        razorpayOrderId = order.id;
      } catch (err: any) {
        console.error('Razorpay Order Creation Failed:', err);
        throw new BadRequestException(`Payment creation failed: ${err.message || err}`);
      }
    }

    // Create a pending payment in PostgreSQL
    const payment = await this.prisma.payment.create({
      data: {
        projectId,
        amount: amountPaise,
        type,
        status: PaymentStatus.PENDING,
        razorpayOrderId
      }
    });

    return {
      paymentId: payment.id,
      checkoutUrl: `/payment/checkout?order=${payment.razorpayOrderId}`,
      amount: amountPaise,
      razorpayOrderId: payment.razorpayOrderId,
    };
  }

  /**
   * Verifies Razorpay webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) return true; // fallback for dev

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Handles webhook from Razorpay
   */
  async handleWebhook(event: { event: string; payload: any }) {
    const { event: eventType, payload } = event;

    if (eventType === 'payment.captured') {
      const entity = payload.payment.entity;
      const orderId = entity.order_id;
      
      const payment = await this.prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (!payment) {
        throw new NotFoundException(`Payment record for order ${orderId} not found`);
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          razorpayPaymentId: entity.id,
        }
      });

      await this.generateInvoice(payment.id);
      return updatedPayment;
    }

    if (eventType === 'payment.failed') {
      const entity = payload.payment.entity;
      const orderId = entity.order_id;

      const payment = await this.prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
          }
        });
      }
    }
  }

  /**
   * Generates an invoice record with an S3 path
   */
  private async generateInvoice(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const subtotal = Math.floor(payment.amount / 1.18);
    const gstAmount = payment.amount - subtotal;
    const invoiceNumber = `MPINV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    return this.prisma.invoice.create({
      data: {
        paymentId,
        invoiceNumber,
        subtotal,
        gstRate: 18,
        gstAmount,
        totalAmount: payment.amount,
        pdfUrl: `invoices/${invoiceNumber}.pdf` // S3 Key stored in database (signed on fetch)
      }
    });
  }

  /**
   * Retrieve all invoices for a client and sign their S3 pdfUrls
   */
  async getClientInvoices(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        payment: {
          project: {
            booking: {
              client: {
                userId
              }
            }
          }
        }
      },
      include: {
        payment: {
          include: {
            project: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    for (const invoice of invoices) {
      if (invoice.pdfUrl && !invoice.pdfUrl.startsWith('http')) {
        invoice.pdfUrl = await this.fileService.getDownloadUrl(invoice.pdfUrl);
      }
    }

    return invoices;
  }
}
