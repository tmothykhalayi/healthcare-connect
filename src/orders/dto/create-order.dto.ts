import { IsString, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  patientId: string;

   @IsString()
  OrderId: string;

  @IsDateString()
  orderDate: string;

  @IsEnum(['pending', 'processed', 'shipped', 'delivered', 'cancelled'])
  status: string;

  @IsNumber()
  totalAmount: number;
}
