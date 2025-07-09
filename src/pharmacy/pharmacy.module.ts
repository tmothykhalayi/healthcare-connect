import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Pharmacy } from './entities/pharmacy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pharmacy, Users]), // Register repositories for Pharmacy and User entities
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
