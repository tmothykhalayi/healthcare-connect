import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export class CreatePatientDto {
  @ApiProperty({ example: 1, description: 'User ID from users table' })
  @IsNumber()
  userId: number;

  @ApiProperty({ 
    example: 'male', 
    description: 'Patient gender',
    enum: Gender
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '1990-05-15', description: 'Patient date of birth (YYYY-MM-DD)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: '15559876543', description: 'Patient phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St, City, State 12345', description: 'Patient address' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Jane Doe - 15559876543', description: 'Emergency contact information' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: 'No significant medical history', description: 'Patient medical history' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({ 
    example: ['Penicillin', 'Peanuts'], 
    description: 'List of patient allergies',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: 1, description: 'Assigned doctor ID (from doctors table)' })
  @IsOptional()
  @IsNumber()
  assignedDoctorId?: number;

  @ApiPropertyOptional({ example: 'A+', description: 'Blood type' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ example: 70.5, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 175.5, description: 'Height in cm' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 'active', description: 'Patient status', default: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
