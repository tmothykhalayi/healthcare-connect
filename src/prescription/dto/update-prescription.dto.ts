import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsOptional()
  @IsInt()
  pharmacistId?: number;

  @IsOptional()
  @IsDateString()
  fulfilledDate?: Date;
}
