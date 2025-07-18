import { Module } from '@nestjs/common';
import { PharmacistService } from './pharmacist.service';
import { PharmacistController } from './pharmacist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacist } from './entities/pharmacist.entity';
import { Users } from '../users/entities/user.entity'; // Import Users entity
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity'; // Import Pharmacy entity

@Module({
  imports: [TypeOrmModule.forFeature([Pharmacist, Users, Pharmacy])], // Add Pharmacy here
  controllers: [PharmacistController],
  providers: [PharmacistService],
  exports: [PharmacistService],
})
export class PharmacistModule {}
