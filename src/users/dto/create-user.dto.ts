
// dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6) // Example minimum password length
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsBoolean()
  isEmailVerified: boolean;
}
