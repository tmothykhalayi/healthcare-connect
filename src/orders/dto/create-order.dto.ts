import { ApiProperty } from '@nestjs/swagger';
import {IsInt,IsDateString,IsString,IsNumber,IsNotEmpty,  IsPositive, IsOptional,} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    example: 1,
    description: 'Patient ID associated with the order',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  patientId: number;

  @ApiProperty({
    example: '2025-07-01T10:00:00Z',
    description: 'Date when the order was placed',
  })
  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @ApiProperty({
    example: 'pending',
    description: 'Current status of the order',
  })
  @IsString()
  @IsNotEmpty()
  orderStatus: string;

  @ApiProperty({
    example: 150.0,
    description: 'Total amount for the order',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({
    example: '234',
    description: 'Custom Order ID',
  })
  @IsString()
  @IsNotEmpty()
  OrderId: string;
  
  status: string;

  @ApiProperty({
    example: 1,
    description: 'Pharmacy ID associated with the order',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  pharmacyId: number;

  @ApiProperty({
    example: 1,
    description: 'Medicine ID associated with the order',
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  medicineId?: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of medicine ordered',
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;
}
