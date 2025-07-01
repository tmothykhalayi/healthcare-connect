import { IsString, IsDateString, IsEnum, IsNumber,IsNotEmpty , IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateOrderDto {

  @IsDateString()
  orderDate: string;

  @IsEnum(['pending', 'processed', 'shipped', 'delivered', 'cancelled'])
  status: string;


  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  OrderId: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount: number;
}


