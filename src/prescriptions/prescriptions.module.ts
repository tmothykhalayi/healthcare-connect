import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, Doctor, Patient])],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
