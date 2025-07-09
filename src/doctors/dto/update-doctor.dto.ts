import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDoctorDto } from './create-doctor.dto';
import {
  IsInt,
  IsString,
  IsOptional,
  Matches,
  IsPositive,
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
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid international phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '456 Health Plaza, City, State 54321' })
  @IsOptional()
  @IsString()
  officeAddress?: string;
}
