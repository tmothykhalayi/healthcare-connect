import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsPositive,
  IsIn,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  patientId: number;

  @ApiProperty({ example: 1, description: 'Doctor ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  doctorId: number;

  @ApiProperty({ example: 1, description: 'Slot ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  slotId: number;

  @ApiProperty({
    example: '2025-07-05',
    description: 'Date of the appointment (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '10:00',
    description: 'Time of the appointment (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 'Dental Checkup', description: 'Title of appointment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ 
    example: 30, 
    description: 'Duration in minutes', 
    default: 30 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  duration?: number;

  @ApiProperty({ example: 'Regular checkup', description: 'Reason for appointment' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    example: 'scheduled',
    description: 'Appointment status',
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'],
    default: 'scheduled',
  })
  @IsOptional()
  @IsIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'])
  status?: string;

  @ApiPropertyOptional({
    example: 'normal',
    description: 'Appointment priority',
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
  })
  @IsOptional()
  @IsIn(['normal', 'urgent', 'emergency'])
  priority?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Parent appointment ID for follow-ups',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  parentAppointmentId?: number;

  @ApiPropertyOptional({
    example: 'Patient requested morning appointment',
    description: 'General notes',
    default: '',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Initial consultation notes',
    description: 'Medical notes',
    default: '',
  })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiPropertyOptional({
    example: 'Routine examination',
    description: 'Initial diagnosis or assessment',
    default: '',
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({
    example: 'No prescription at this time',
    description: 'Prescription details',
    default: '',
  })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional({
    example: {
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6°F',
    },
    description: 'Vital signs',
    default: {},
  })
  @IsOptional()
  @IsObject()
  vitals?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Zoom meeting URL for the appointment user',
    example: 'https://zoom.us/j/123456789',
  })
  @IsOptional()
  @IsString()
  user_url?: string;

  @ApiPropertyOptional({
    description: 'Zoom meeting URL for the admin/host',
    example: 'https://zoom.us/s/123456789',
  })
  @IsOptional()
  @IsString()
  admin_url?: string;
}
