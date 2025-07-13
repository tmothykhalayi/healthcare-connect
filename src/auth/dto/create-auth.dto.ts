import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: 'TimothyKhalayi@admin.com',
    description: 'The email address of the user',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Khalayi123',
    description: 'The password for the user account',
    required: true,
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Timothy',
    description: 'The first name of the user',
    required: false,
  })
  firstName?: string;
  @ApiProperty({
    example: 'Khalayi',
    description: 'The last name of the user',
    required: false,
  })
  lastName?: string;
}
