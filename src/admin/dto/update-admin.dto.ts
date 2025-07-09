import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  Matches,
} from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiPropertyOptional({ example: 'super_admin' })
  @IsOptional()
  @IsIn(['super_admin', 'admin', 'moderator'])
  adminLevel?: string;

  @ApiPropertyOptional({ example: 'suspended' })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: '15559999999',
    description: 'Admin phone number (digits only)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message:
      'phoneNumber must be a valid phone number with 10-15 digits (no special characters)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '15558888888',
    description: 'Emergency contact (digits only)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message:
      'emergencyContact must be a valid phone number with 10-15 digits (no special characters)',
  })
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '2025-07-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  lastLogin?: string;
}
