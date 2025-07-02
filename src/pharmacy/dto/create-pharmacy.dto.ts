import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePharmacyDto {
  @ApiProperty({ example: 1, description: 'User ID from users table' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'ABC Pharmacy', description: 'Name of pharmacy' })
  @IsString()
  pharmacyName: string;

  @ApiProperty({ example: 'PH12345', description: 'Pharmacy license number' })
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional({ example: '123 Main St, City, State 12345', description: 'Pharmacy address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '15551234567', description: 'Pharmacy phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Pharmacy status', default: 'pending_verification' })
  @IsOptional()
  @IsString()
  status?: string;
}
