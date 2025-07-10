import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiPropertyOptional({ example: 1, description: 'User ID who made the payment' })
  userId?: number;

  @ApiPropertyOptional({ example: 'ORD-001', description: 'OrderId (string) related to this payment' })
  orderId?: string;

  @ApiPropertyOptional({ example: 150.0, description: 'Payment amount' })
  amount?: number;

  @ApiPropertyOptional({ example: 'credit_card', description: 'Payment method' })
  paymentMethod?: string;

  @ApiPropertyOptional({ enum: PaymentStatus, enumName: 'PaymentStatus', description: 'Payment status' })
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Order', description: 'Related entity type (e.g., Order, Appointment)' })
  relatedEntityType?: string;

  @ApiPropertyOptional({ example: 1, description: 'Related entity ID (Order ID, Appointment ID, etc.)' })
  relatedEntityId?: number;

  @ApiPropertyOptional({ example: 'TXN123456', description: 'Transaction ID' })
  transactionId?: string;
}
