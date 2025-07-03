import { Module } from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { TelemedicineController } from './telemedicine.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { TelemedicineAppointment } from './entities/telemedicine.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Medical } from '../records/medical/entities/medical.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Doctor, TelemedicineAppointment, Medical, Payment]),
  ],
  controllers: [TelemedicineController],
  providers: [TelemedicineService],
})
export class TelemedicineModule {}