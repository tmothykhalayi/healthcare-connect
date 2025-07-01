import { IsString, IsDateString, IsOptional, IsUUID, IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  gender: string;

  @IsString()
  address: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsUUID()
  assignedDoctorId: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string; // JSON string or just plain text
}
