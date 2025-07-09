import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsPositive,
  IsIn,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTelemedicineDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  patientId: number;

  @ApiProperty({ example: 5, description: 'Doctor ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  doctorId: number;

  @ApiProperty({
    example: '2025-07-06',
    description: 'Appointment date (YYYY-MM-DD)',
  })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: '10:00', description: 'Appointment time (HH:MM)' })
  @IsString()
  appointmentTime: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Duration in minutes',
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(120)
  duration?: number;

  @ApiPropertyOptional({
    example: 'scheduled',
    description: 'Appointment status',
    enum: [
      'scheduled',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
    ],
    default: 'scheduled',
  })
  @IsOptional()
  @IsIn([
    'scheduled',
    'confirmed',
    'in-progress',
    'completed',
    'cancelled',
    'no-show',
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 'Telemedicine video call for routine consultation',
    description: 'Additional notes about the appointment',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  
  scheduledAt: string | Date;
 

}
