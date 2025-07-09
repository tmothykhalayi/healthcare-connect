import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsPositive,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicalDto {
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

  @ApiPropertyOptional({
    example: 1,
    description: 'Appointment ID (if related)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  appointmentId?: number;

  @ApiProperty({
    example: 'diagnosis',
    description: 'Record type',
    enum: [
      'diagnosis',
      'prescription',
      'lab_result',
      'imaging',
      'surgery',
      'consultation',
      'follow_up',
      'emergency',
    ],
  })
  @IsIn([
    'diagnosis',
    'prescription',
    'lab_result',
    'imaging',
    'surgery',
    'consultation',
    'follow_up',
    'emergency',
  ])
  recordType: string;

  @ApiProperty({
    example: 'Routine Checkup Results',
    description: 'Record title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Patient presented with symptoms of...',
    description: 'Detailed description',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 'Hypertension, Stage 1',
    description: 'Diagnosis information',
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({
    example: 'Lifestyle modifications and medication',
    description: 'Treatment prescribed',
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({
    example: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'once daily' }],
    description: 'Medications prescribed',
  })
  @IsOptional()
  medications?: any;

  @ApiPropertyOptional({
    example: { bloodPressure: '140/90', cholesterol: '220mg/dL' },
    description: 'Lab results',
  })
  @IsOptional()
  labResults?: any;

  @ApiPropertyOptional({
    example: {
      bloodPressure: '140/90',
      heartRate: '75',
      temperature: '98.6°F',
    },
    description: 'Vital signs',
  })
  @IsOptional()
  vitals?: any;

  @ApiPropertyOptional({
    example: ['Penicillin', 'Shellfish'],
    description: 'Known allergies',
  })
  @IsOptional()
  allergies?: any;

  @ApiPropertyOptional({
    example: 'Return in 3 months for follow-up',
    description: 'Follow-up instructions',
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({
    example: '2025-10-01T10:00:00Z',
    description: 'Next appointment date',
  })
  @IsOptional()
  @IsDateString()
  nextAppointmentDate?: string;

  @ApiPropertyOptional({
    example: 'normal',
    description: 'Record priority',
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal',
  })
  @IsOptional()
  @IsIn(['normal', 'urgent', 'critical'])
  priority?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Record status',
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'archived', 'deleted'])
  status?: string;

  @ApiPropertyOptional({
    example: 'Patient responded well to treatment',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: [
      { name: 'X-ray_chest.pdf', url: '/files/xray123.pdf', type: 'imaging' },
    ],
    description: 'Attachments/documents',
  })
  @IsOptional()
  attachments?: any;
}
