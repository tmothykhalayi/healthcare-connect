import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsDateString,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
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
  status: string;

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

  @ApiProperty({
    example: 1,
    description: 'Pharmacy ID associated with the order',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  pharmacyId: number;
}
