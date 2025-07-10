import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsString()
  @IsNotEmpty()
  relatedEntityType: string;

  @IsString()
  @IsNotEmpty()
  relatedEntityId: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
