import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ description: 'User ID (who is adding this medicine)' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Medicine name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Medicine description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Medicine manufacturer' })
  @IsString()
  manufacturer: string;

  @ApiProperty({ description: 'Medicine price' })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ description: 'Medicine expiry date (YYYY-MM-DD)' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'Medicine category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Medicine dosage form (tablet, capsule, syrup, etc.)', required: false })
  @IsOptional()
  @IsString()
  dosageForm?: string;

  @ApiProperty({ description: 'Medicine strength (e.g., 500mg, 10ml)', required: false })
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiProperty({ description: 'Prescription required', required: false })
  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiProperty({ description: 'Medicine status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Stock quantity', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ description: 'Minimum stock level', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStockLevel?: number;
}
