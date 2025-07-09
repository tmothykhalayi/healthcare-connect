import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @IsString()
  relatedEntityType: string;

  @IsString()
  relatedEntityId: string;

  @IsString()
  transactionId: string;
}
