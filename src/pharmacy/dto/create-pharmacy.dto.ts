import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreatePharmacyDto {
  @ApiProperty({ description: 'User ID (from users table)' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Pharmacy name' })
  @IsString()
  pharmacyName: string;

  @ApiProperty({ description: 'Pharmacy license number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'Pharmacy phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Pharmacy address' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Pharmacy email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Pharmacy opening hours' })
  @IsOptional()
  @IsString()
  openingHours?: string;

  @ApiPropertyOptional({ description: 'Services offered' })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Delivery available' })
  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Online ordering available' })
  @IsOptional()
  @IsBoolean()
  onlineOrderingAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Insurance plans accepted' })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  insurancePlansAccepted?: string[];

  @ApiPropertyOptional({ description: 'Pharmacy status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
