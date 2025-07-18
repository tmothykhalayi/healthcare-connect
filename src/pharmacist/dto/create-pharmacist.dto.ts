import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePharmacistDto {
  @ApiProperty({ description: 'User ID associated with the pharmacist' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Pharmacy ID where pharmacist works' })
  @IsNumber()
  @IsNotEmpty()
  pharmacyId: number;

  @ApiProperty({ description: 'Pharmacist license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;
}
