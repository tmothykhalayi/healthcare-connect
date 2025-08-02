import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  medication: string;

  @IsOptional()
  @IsString()
  dosageInstructions?: string;
}
