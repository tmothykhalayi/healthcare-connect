import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import {
  IsUUID,
  IsDateString,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({ example: 12345 })
  @IsOptional()
  @IsNumber()
  patientId?: number;

  @ApiPropertyOptional({ example: '2025-07-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ example: 'processed' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 175.0 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ example: '234' })
  @IsOptional()
  @IsString()
  orderId?: string;
}
