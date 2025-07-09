import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
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

  @ApiProperty({ description: 'Pharmacy email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Pharmacy opening hours', required: false })
  @IsOptional()
  @IsString()
  openingHours?: string;

  @ApiProperty({ description: 'Services offered', required: false })
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiProperty({ description: 'Delivery available', required: false })
  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @ApiProperty({ description: 'Online ordering available', required: false })
  @IsOptional()
  @IsBoolean()
  onlineOrderingAvailable?: boolean;

  @ApiProperty({ description: 'Insurance plans accepted', required: false })
  @IsOptional()
  @IsArray()
  insurancePlansAccepted?: string[];

  @ApiProperty({ description: 'Pharmacy status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
