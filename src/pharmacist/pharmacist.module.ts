import { Module } from '@nestjs/common';
import { PharmacistService } from './pharmacist.service';
import { PharmacistController } from './pharmacist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacist } from './entities/pharmacist.entity';
import { Users } from '../users/entities/user.entity'; 
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Pharmacist, Users, Pharmacy])], 
  controllers: [PharmacistController],
  providers: [PharmacistService],
  exports: [PharmacistService],
})
export class PharmacistModule {}
