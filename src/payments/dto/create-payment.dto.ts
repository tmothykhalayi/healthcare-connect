import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'User ID who made the payment' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'ORD-001',
    description: 'OrderId (string) related to this payment',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 150.0, description: 'Payment amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'credit_card', description: 'Payment method' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    description: 'Payment status',
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty({
    example: 'Order',
    description: 'Related entity type (e.g., Order, Appointment)',
  })
  @IsString()
  @IsNotEmpty()
  relatedEntityType: string;

  @ApiProperty({
    example: 1,
    description: 'Related entity ID (Order ID, Appointment ID, etc.)',
  })
  @IsNumber()
  @IsNotEmpty()
  relatedEntityId: number;

  @ApiProperty({ example: 'TXN123456', description: 'Transaction ID' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
