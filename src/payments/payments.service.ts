import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Users } from 'src/users/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Order } from '../orders/entities/order.entity'
//import { AppointmentStatus, OrderStatus } from 'src/enums';
import * as crypto from 'crypto';
import axios from 'axios';

// Move API key to environment variable
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY || 'sk_test_5b533438ddd2423da733c718b434b2771d9dadd6');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
  ) {
    // Validate environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      this.logger.warn('PAYSTACK_SECRET_KEY not found in environment variables, using test key');
    }
    if (!process.env.FRONTEND_URL) {
      this.logger.warn('FRONTEND_URL not found in environment variables');
    }
  }

  //INITIALIZE PAYMENT
  async initializePayment(createPaymentDto: CreatePaymentDto, user: Users): Promise<any> {
    try {
      this.logger.log(`Initializing payment for user ${user.id}`);
      this.logger.log(`Payment data:`, createPaymentDto);

      // Validate input
      if (!createPaymentDto.amount || createPaymentDto.amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      //if (!process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_')) {
        if (!process.env.PAYSTACK_SECRET_KEY || !process.env.PAYSTACK_SECRET_KEY.startsWith('sk_')) {

        throw new BadRequestException('Invalid Paystack secret key configuration');
      }

      // Prepare Paystack payload with KES currency
      const paystackPayload = {
        email: createPaymentDto.email,
        amount: Math.round(createPaymentDto.amount * 100), // Convert to cents (KES cents)
        currency: 'KES', // Changed from NGN to KES
        callback_url: createPaymentDto.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-verify`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Full Name',
              variable_name: 'full_name',
              value: createPaymentDto.fullName
            },
            {
              display_name: 'Phone Number',
              variable_name: 'phone_number',
              value: createPaymentDto.phoneNumber
            },
            {
              display_name: 'Payment Type',
              variable_name: 'payment_type',
              value: createPaymentDto.type
            }
          ]
        }
      };

      this.logger.log(`Paystack payload:`, JSON.stringify(paystackPayload, null, 2));

      // Initialize payment with Paystack
      let paystackResponse;
      try {
        this.logger.log(`=== INITIALIZING PAYSTACK PAYMENT ===`);
        this.logger.log(`Sending payload to Paystack:`, JSON.stringify(paystackPayload, null, 2));
        paystackResponse = await paystack.transaction.initialize(paystackPayload);
        this.logger.log(`Paystack response:`, JSON.stringify(paystackResponse, null, 2));
        this.logger.log(`Paystack authorization URL: ${paystackResponse.data.authorization_url}`);
        this.logger.log(`Paystack access code: ${paystackResponse.data.access_code}`);
        this.logger.log(`Paystack reference: ${paystackResponse.data.reference}`);
      } catch (paystackError) {
        this.logger.error('Paystack API Error:', paystackError);
        this.logger.error('Paystack Error Details:', {
          message: paystackError.message,
          response: paystackError.response?.data,
          status: paystackError.response?.status,
          statusText: paystackError.response?.statusText
        });
        throw new BadRequestException(`Paystack API Error: ${paystackError.message}`);
      }

      if (!paystackResponse || !paystackResponse.status) {
        this.logger.error('Paystack initialization failed:', paystackResponse);
        throw new BadRequestException(`Paystack initialization failed: ${paystackResponse?.message || 'Unknown error'}`);
      }

      // Use the reference returned by Paystack
      const paystackReference = paystackResponse.data.reference;

      // Validate appointment or pharmacy order exists
      // let appointment: Appointment | null = null;
      // let pharmacyOrder: PharmacyOrder | null = null;

      // if (createPaymentDto.type === PaymentType.APPOINTMENT && createPaymentDto.appointmentId) {
      //   appointment = await this.appointmentRepository.findOne({
      //     where: { id: createPaymentDto.appointmentId },
      //     relations: ['patient', 'doctor']
      //   });
      //   if (!appointment) {
      //     throw new NotFoundException('Appointment not found');
      //   }
      // }

      if (createPaymentDto.type === PaymentType.ORDER && createPaymentDto.orderId) {
        const order = await this.OrderRepository.findOne({
          where: { id: createPaymentDto.orderId },
          relations: ['patient']
        });
        if (!order) {
          throw new NotFoundException('Pharmacy order not found');
        }

        // Save payment record
        const paymentData = {
          fullName: createPaymentDto.fullName,
          email: createPaymentDto.email,
          phoneNumber: createPaymentDto.phoneNumber,
          amount: createPaymentDto.amount,
          type: createPaymentDto.type,
          userId: user.id,
          user: user,
          order: order,
          paystackReference: paystackReference, // Use Paystack's reference
          paystackAccessCode: paystackResponse.data.access_code,
          paystackAuthorizationUrl: paystackResponse.data.authorization_url,
          status: PaymentStatus.PENDING,
          notes: createPaymentDto.notes || undefined
        };

        const savedPayment = await this.paymentRepository.save(paymentData);
        this.logger.log(`Payment saved with ID: ${savedPayment.id}`);

        return {
          payment: savedPayment,
          paystack_data: {
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code,
            reference: paystackReference // Use Paystack's reference
          }
        };
      }

      // Save payment record
      const paymentData = {
        fullName: createPaymentDto.fullName,
        email: createPaymentDto.email,
        phoneNumber: createPaymentDto.phoneNumber,
        amount: createPaymentDto.amount,
        type: createPaymentDto.type,
        userId: user.id,
        user: user,
        paystackReference: paystackReference, // Use Paystack's reference
        paystackAccessCode: paystackResponse.data.access_code,
        paystackAuthorizationUrl: paystackResponse.data.authorization_url,
        status: PaymentStatus.PENDING,
        notes: createPaymentDto.notes || undefined
      };

      const savedPayment = await this.paymentRepository.save(paymentData);
      this.logger.log(`Payment saved with ID: ${savedPayment.id}`);
      this.logger.log(`Payment reference: ${savedPayment.paystackReference}`);
      this.logger.log(`Payment status: ${savedPayment.status}`);

      const response = {
        payment: savedPayment,
        paystack_data: {
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackReference // Use Paystack's reference
        }
      };
      
      this.logger.log(`Returning response:`, JSON.stringify(response, null, 2));
      return response;

    } catch (error) {
      this.logger.error('Payment initialization failed:', error);

      // Re-throw known errors
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestException(`Payment initialization failed: ${error.message}`);
    }
  }

  private generateReference(): string {
    return `PAY_${Date.now()}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  //UPDATE PAYMENT STATUS
  async updatePaymentStatus(reference: string, status: PaymentStatus): Promise<Payment> {
    this.logger.log(`=== UPDATE PAYMENT STATUS ===`);
    this.logger.log(`Updating payment with reference: ${reference} to status: ${status}`);
    
    const payment = await this.paymentRepository.findOne({
      where: { paystackReference: reference },
      relations: ['appointment', 'order']
    });

    if (!payment) {
      this.logger.error(`Payment not found for reference: ${reference}`);
      throw new NotFoundException('Payment not found');
    }

    this.logger.log(`Found payment - ID: ${payment.id}, Current status: ${payment.status}`);
    this.logger.log(`Updating status from ${payment.status} to ${status}`);
    
    payment.status = status;
    const updatedPayment = await this.paymentRepository.save(payment);
    
    this.logger.log(`✅ Payment status updated successfully - ID: ${updatedPayment.id}, New status: ${updatedPayment.status}`);
    return updatedPayment;
  }

  //VERIFY PAYMENT
  async verifyPayment(reference: string): Promise<any> {
    try {
      this.logger.log(`=== PAYMENT VERIFICATION START ===`);
      this.logger.log(`Verifying payment with reference: ${reference}`);
      
      const payment = await this.paymentRepository.findOne({
        where: { paystackReference: reference },
        relations: [
          //'appointment', 
          'order']
      });
      
      this.logger.log('Database payment record:', JSON.stringify(payment, null, 2));
      this.logger.log('Payment order relation:', payment?.order ? JSON.stringify(payment.order, null, 2) : 'No order');

      if (!payment) {
        this.logger.error(`Payment not found for reference: ${reference}`);
        this.logger.error(`Checking all payments in database...`);
        const allPayments = await this.paymentRepository.find({
          select: ['id', 'paystackReference', 'status', 'createdAt', 'type']
        });
        this.logger.error(`All payments in database:`, JSON.stringify(allPayments, null, 2));
        
        // Check if there are any payments with similar references
        const similarPayments = allPayments.filter(p => 
          p.paystackReference && p.paystackReference.includes(reference.split('_')[1])
        );
        if (similarPayments.length > 0) {
          this.logger.error(`Found similar payments:`, JSON.stringify(similarPayments, null, 2));
        }
        
        throw new NotFoundException('Payment not found');
      }
      
      this.logger.log(`Payment found - ID: ${payment.id}, Status: ${payment.status}, Type: ${payment.type}`);

      // Verify with Paystack using axios
      this.logger.log(`Calling Paystack API to verify transaction: ${reference}`);
      this.logger.log(`Using Paystack secret key: ${process.env.PAYSTACK_SECRET_KEY ? 'Present' : 'Missing'}`);
      
      let paystackResponse;
      try {
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        paystackResponse = response.data;
        this.logger.log(`=== PAYSTACK API RESPONSE ===`);
        this.logger.log(`Paystack response status: ${paystackResponse.status}`);
        this.logger.log(`Paystack response data:`, JSON.stringify(paystackResponse.data, null, 2));
        this.logger.log(`Full Paystack response:`, JSON.stringify(paystackResponse, null, 2));
      } catch (paystackError: any) {
        this.logger.error('=== PAYSTACK API ERROR ===');
        this.logger.error('Paystack error response:', paystackError?.response?.data);
        this.logger.error('Paystack error status:', paystackError?.response?.status);
        this.logger.error('Paystack error message:', paystackError.message);
        const errorMessage = paystackError?.response?.data?.message || paystackError.message;
        if (errorMessage.includes('Transaction reference not found')) {
          throw new BadRequestException(
            'Payment not found on Paystack. This usually means the payment was not completed. Please try making the payment again.'
          );
        } else {
          throw new BadRequestException(
            `Paystack Verify API Error: ${errorMessage}`
          );
        }
      }

      // Check if the transaction was successful
      this.logger.log(`=== VERIFICATION LOGIC ===`);
      this.logger.log(`Paystack response.status: ${paystackResponse.status}`);
      this.logger.log(`Paystack response.data exists: ${!!paystackResponse.data}`);
      this.logger.log(`Paystack response.data.status: ${paystackResponse.data?.status}`);
      
      if (paystackResponse.status && paystackResponse.data && paystackResponse.data.status === 'success') {
        this.logger.log(`✅ Payment successful for reference: ${reference}`);
        
        // Update payment status in database
        this.logger.log(`Updating payment status to SUCCESS...`);
        const updatedPayment = await this.updatePaymentStatus(reference, PaymentStatus.SUCCESS);
        this.logger.log(`Payment status updated successfully. New status: ${updatedPayment.status}`);
        
        // Update order status if payment is for an order
        if (payment.type === PaymentType.ORDER) {
          if (payment.order) {
            this.logger.log(`Updating order status. Order ID: ${payment.order.id}, Current status: ${payment.order.status}`);
            payment.order.status = 'completed';
            try {
              const updatedOrder = await this.OrderRepository.save(payment.order);
              this.logger.log(`✅ Order status updated successfully. Order ID: ${updatedOrder.id}, New status: ${updatedOrder.status}`);
            } catch (err) {
              this.logger.error(`❌ Failed to update order status for Order ID: ${payment.order.id}`, err);
            }
          } else {
            this.logger.error(`❌ Payment.Order is undefined during verification! Payment ID: ${payment.id}, Reference: ${reference}`);
            this.logger.error(`Payment type: ${payment.type}, Payment data:`, JSON.stringify(payment, null, 2));
          }
        }
        
        this.logger.log(`=== VERIFICATION COMPLETE - SUCCESS ===`);
        return paystackResponse.data;
      } else {
        this.logger.log(`❌ Payment not successful. Paystack response:`, JSON.stringify(paystackResponse, null, 2));
        // Update payment status to failed if not successful
        this.logger.log(`Updating payment status to FAILED...`);
        await this.updatePaymentStatus(reference, PaymentStatus.FAILED);
        this.logger.log(`=== VERIFICATION COMPLETE - FAILED ===`);
      }

      throw new BadRequestException('Payment verification failed');
    } catch (error) {
      this.logger.error('Payment verification failed', error.stack);
      throw error;
    }
  }

  async getPaymentById(id: string, user: Users): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user', 
        //'appointment',
         'order']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async listPayments(user: Users): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { user: { id: user.id } },
      relations: ['appointment', 'order'],
      order: { createdAt: 'DESC' }
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({
      relations: ['user', 'order'],
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        amount: true,
        status: true,
        type: true,
        paystackReference: true,
        paystackAccessCode: true,
        paystackAuthorizationUrl: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
        order: {
          id: true,
          OrderId: true,
          totalAmount: true,
          status: true,
        }
      },
      order: { createdAt: 'DESC' }
    });

    this.logger.log(`Found ${payments.length} payments`);
    if (payments.length > 0) {
      this.logger.log(`Sample payment data:`, {
        id: payments[0].id,
        fullName: payments[0].fullName,
        email: payments[0].email,
        userId: payments[0].userId,
        user: payments[0].user,
        hasUser: !!payments[0].user,
        userFirstName: payments[0].user?.firstName,
        userLastName: payments[0].user?.lastName,
      });
    }

    return payments;
  }

  async getPaymentsByPharmacy(pharmacyId: number): Promise<Payment[]> {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.pharmacy', 'pharmacy')
      .where('order.pharmacyId = :pharmacyId', { pharmacyId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    this.logger.log(`Found ${payments.length} payments for pharmacy ${pharmacyId}`);
    return payments;
  }

  async refundPayment(id: string, user: Users): Promise<Payment> {
    const payment = await this.getPaymentById(id, user);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    try {
      const refundResponse = await paystack.refund.create({
        transaction: payment.paystackReference,
        amount: payment.amount * 100, // Amount in cents (KES)
        currency: 'KES' // Changed from NGN to KES
      });

      if (refundResponse.status) {
        payment.status = PaymentStatus.REFUNDED;
        return await this.paymentRepository.save(payment);
      }

      throw new BadRequestException('Refund failed');
    } catch (error) {
      this.logger.error('Refund failed', error.stack);
      throw error;
    }
  }

  async cancelPayment(id: string, user: Users): Promise<Payment> {
    const payment = await this.getPaymentById(id, user);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    payment.status = PaymentStatus.CANCELLED;
    return await this.paymentRepository.save(payment);
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto, user: Users): Promise<Payment> {
    const payment = await this.getPaymentById(id, user);

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async deletePayment(id: string, user: Users): Promise<void> {
    const payment = await this.getPaymentById(id, user);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Cannot delete successful payments');
    }

    await this.paymentRepository.remove(payment);
  }

  async deletePaymentAdmin(id: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'order']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Cannot delete successful payments');
    }

    await this.paymentRepository.remove(payment);
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    try {
      // Verify webhook signature
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || 'sk_test_742aa04eba08efb440f9eac360395c2b488e3093')
        .update(JSON.stringify(payload))
        .digest('hex');

      if (hash !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const { event, data } = payload;
      this.logger.log(`Webhook received: ${event} for reference: ${data.reference}`);

      if (event === 'charge.success') {
        const payment = await this.updatePaymentStatus(data.reference, PaymentStatus.SUCCESS);
        this.logger.log(`Payment webhook processed: ${data.reference} - SUCCESS`);
        
        // Update order status if payment is for an order
        if (payment.type === PaymentType.ORDER && payment.order) {
          this.logger.log(`[WEBHOOK] Updating order status. Order ID: ${payment.order.id}, Current status: ${payment.order.status}`);
          payment.order.status = 'completed';
          try {
            const updatedOrder = await this.OrderRepository.save(payment.order);
            this.logger.log(`[WEBHOOK] Updated order. Order ID: ${updatedOrder.id}, New status: ${updatedOrder.status}`);
          } catch (err) {
            this.logger.error(`[WEBHOOK] Failed to update order status for Order ID: ${payment.order.id}`, err);
          }
        }
      } else if (event === 'charge.failed') {
        await this.updatePaymentStatus(data.reference, PaymentStatus.FAILED);
        this.logger.log(`Payment webhook processed: ${data.reference} - FAILED`);
      }
    } catch (error) {
      this.logger.error('Webhook processing failed', error.stack);
      throw error;
    }
  }
}