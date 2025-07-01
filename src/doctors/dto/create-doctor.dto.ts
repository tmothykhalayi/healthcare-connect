import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Matches, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @ApiProperty({ 
    example: 1, 
    description: 'User ID associated with the doctor' 
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({ 
    example: 'Cardiology', 
    description: 'Doctor specialization'
  })
  @IsString()
  specialization: string;

  @ApiProperty({ 
    example: 'MD123456', 
    description: 'Doctor license number'
  })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ 
    example: 10, 
    description: 'Doctor years of experience'
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  yearsOfExperience: number;

  @ApiProperty({ 
    example: '+15551234567', 
    description: 'Doctor phone number'
  })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid international phone number'
  })
  phoneNumber: string;

  @ApiProperty({ 
    example: '123 Medical Center Dr, City, State 12345', 
    description: 'Doctor office address',
    required: false
  })
  @IsOptional()
  @IsString()
  officeAddress?: string;
}
