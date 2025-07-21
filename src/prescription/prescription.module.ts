import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { Prescription } from './entities/prescription.entity';

// Related entities
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacist } from '../pharmacist/entities/pharmacist.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      Doctor,
      Patient,
      Pharmacist,
      Medicine,
    ]),
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
