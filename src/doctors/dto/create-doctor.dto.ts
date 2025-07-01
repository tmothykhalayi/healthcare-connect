import { IsString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateDoctorDto {

    
  @IsUUID()
  userId: string;

  @IsString()
  specialisation: string;

  @IsString()
  licenseNumber: string;

  @IsInt()
  @Min(0)
  experienceYears: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsInt()
  Id: number;
}
