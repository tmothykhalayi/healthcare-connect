import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({ example: 'confirmed' })
  @IsOptional()
  @IsIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'])
  status?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Patient shows improvement' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiPropertyOptional({ example: 'Patient unable to attend' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiPropertyOptional({ example: 'Doctor unavailable' })
  @IsOptional()
  @IsString()
  rescheduleReason?: string;

  @ApiPropertyOptional({ example: 'Minor respiratory infection' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Amoxicillin 500mg, 3 times daily' })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional({ 
    example: { "bloodPressure": "120/80", "heartRate": "72" },
    description: 'Vital signs' 
  })
  @IsOptional()
  vitals?: any;
}
