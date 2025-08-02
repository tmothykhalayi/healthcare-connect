// create-slot.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateSlotDto {
  @ApiProperty({
    example: '2025-08-01',
    description: 'Date of the slot (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time of the slot (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '10:00',
    description: 'End time of the slot (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    example: 1,
    description: 'Doctor ID for whom the slot belongs',
  })
  @IsInt()
  @Min(1)
  doctorId: number;

  @ApiProperty({ example: true, description: 'Slot availability status' })
  @IsBoolean()
  isAvailable: boolean;
}
