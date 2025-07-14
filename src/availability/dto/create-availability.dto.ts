import { IsNotEmpty, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FrontendAvailabilityType {
  STANDARD = 'standard',
  EMERGENCY = 'emergency',
  CONSULTATION = 'consultation',
}

export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Start time of the availability slot' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time of the availability slot' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ 
    description: 'Type of availability slot',
    enum: FrontendAvailabilityType,
    default: FrontendAvailabilityType.STANDARD
  })
  @IsEnum(FrontendAvailabilityType)
  @IsOptional()
  type?: FrontendAvailabilityType;

  @ApiProperty({ description: 'Additional notes for the availability slot' })
  @IsString()
  @IsOptional()
  notes?: string;
} 