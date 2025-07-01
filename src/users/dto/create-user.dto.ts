// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.PATIENT, 
    description: 'User role' 
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    example: false, 
    description: 'Email verification status',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
