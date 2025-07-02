import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional, IsPositive, Min, Max } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ example: 1, description: 'User ID from users table' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'Cardiology', description: 'Doctor specialization' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 'MD123456', description: 'Medical license number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 10, description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;

  @ApiPropertyOptional({ example: 'Harvard Medical School, Johns Hopkins', description: 'Education and qualifications' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ example: '15551234567', description: 'Doctor phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '456 Medical Center Dr, City, State 12345', description: 'Office address' })
  @IsString()
  officeAddress: string;

  @ApiPropertyOptional({ example: 200.00, description: 'Consultation fee in USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  consultationFee?: number;

  @ApiPropertyOptional({ 
    example: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], 
    description: 'Available days of the week',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ example: '9:00 AM - 5:00 PM', description: 'Available hours' })
  @IsOptional()
  @IsString()
  availableHours?: string;

  @ApiPropertyOptional({ 
    example: 'active', 
    description: 'Doctor status (active, inactive, on_leave)',
    default: 'active'
  })
  @IsOptional()
  @IsString()
  status?: string;
}
