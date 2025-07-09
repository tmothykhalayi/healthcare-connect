import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from './entities/user.entity';
import { AdminModule } from '../admin/admin.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { PatientsModule } from '../patients/patients.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    AdminModule,
    DoctorsModule,
    PatientsModule,
    PharmacyModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
