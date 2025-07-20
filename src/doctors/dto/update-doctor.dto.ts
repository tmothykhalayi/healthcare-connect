import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDoctorDto } from './create-doctor.dto';
import {
  IsInt,
  IsString,
  IsOptional,
  Matches,
  IsPositive,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiPropertyOptional({ example: 'Neurology' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 'MD789012' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: '+15559876543' })
  @IsOptional()
  @Matches(/^[+]?\d{10,15}$/, {
    message: 'phoneNumber must be a valid international phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '456 Health Plaza, City, State 54321' })
  @IsOptional()
  @IsString()
  officeAddress?: string;

  @ApiPropertyOptional({ example: 'MBBS' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ example: 200.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  consultationFee?: number;

  @ApiPropertyOptional({ example: ['Monday', 'Tuesday'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ example: '9:00 AM - 5:00 PM' })
  @IsOptional()
  @IsString()
  availableHours?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
