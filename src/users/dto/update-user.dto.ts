import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PATIENT })
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  isEmailVerified?: boolean;
}
