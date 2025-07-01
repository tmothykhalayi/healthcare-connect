import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString, Matches, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({ 
    example: 1, 
    description: 'User ID associated with the patient' 
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({ 
    example: 'male', 
    description: 'Patient gender',
    enum: ['male', 'female', 'other']
  })
  @IsString()
  gender: string;

  @ApiProperty({ 
    example: '+15551234567', 
    description: 'Patient phone number in international format' 
  })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid international phone number'
  })
  phoneNumber: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Assigned doctor ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  assignedDoctorId?: number;

  @ApiProperty({ 
    example: '123 Main St, City, State 12345', 
    description: 'Patient address',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    example: '1990-05-15', 
    description: 'Patient date of birth',
    required: false
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ 
    example: 'No known allergies. Previous surgery: appendectomy in 2015.', 
    description: 'Patient medical history',
    required: false
  })
  @IsOptional()
  @IsString()
  medicalHistory?: string;
}
