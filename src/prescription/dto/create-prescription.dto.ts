import { IsArray, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreatePrescriptionDto {
  @IsInt()
  doctorId: number;

  @IsInt()
  patientId: number;

  @IsArray()
  @IsInt({ each: true })
  medicineIds: number[];

  @IsOptional()
  @IsDateString()
  issueDate?: Date;
}
