import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsPositive,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  // @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  // @IsOptional()
  // @IsString()
  // gender?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid international phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  assignedDoctorId?: number;

  @ApiPropertyOptional({ example: '123 Main St, City, State 12345' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Updated medical history' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({
    example: 'Jane Doe - 15559876543',
    description: 'Emergency contact information',
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: ['Penicillin', 'Peanuts'],
    description: 'List of patient allergies',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: 'A+', description: 'Blood type' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ example: 70.5, description: 'Weight in kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 175.5, description: 'Height in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Patient status',
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '2025-07-01T10:00:00Z',
    description: 'Last visit timestamp',
  })
  @IsOptional()
  @IsDateString()
  lastVisit?: string;
}
