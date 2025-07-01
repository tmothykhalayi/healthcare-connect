import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { IsInt, IsString, IsOptional, IsDateString, Matches, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid international phone number'
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
}
