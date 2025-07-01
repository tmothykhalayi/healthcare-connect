import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { DoctorsController } from './doctors.controller';
import { Users } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Users])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}