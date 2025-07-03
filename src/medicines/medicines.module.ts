import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { Medicine } from './entities/medicine.entity';
import { Users } from '../users/entities/user.entity';

@Module({
  // Import TypeOrmModule to register the Medicine and User entities
  imports: [
    TypeOrmModule.forFeature([Medicine, Users]), // Register repositories for Medicine and User entities
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}
