import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsPositive, IsIn, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiPropertyOptional({ 
    example: 'admin', 
    description: 'Admin level',
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  })
  @IsOptional()
  @IsIn(['super_admin', 'admin', 'moderator'])
  adminLevel?: string;

  @ApiPropertyOptional({ 
    example: { "users": ["read", "write"], "appointments": ["read"] },
    description: 'Admin permissions' 
  })
  @IsOptional()
  permissions?: any;

  @ApiPropertyOptional({ example: 'IT Department', description: 'Admin department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ 
    example: '15551234567', 
    description: 'Admin phone number (digits only, 10-15 digits)' 
  })
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message: 'phoneNumber must be a valid phone number with 10-15 digits (no special characters)'
  })
  phoneNumber: string;

  @ApiPropertyOptional({ 
    example: '15559876543', 
    description: 'Emergency contact (digits only, 10-15 digits)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message: 'emergencyContact must be a valid phone number with 10-15 digits (no special characters)'
  })
  emergencyContact?: string;

  @ApiPropertyOptional({ 
    example: 'active', 
    description: 'Admin status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ example: 'System administrator', description: 'Admin notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
