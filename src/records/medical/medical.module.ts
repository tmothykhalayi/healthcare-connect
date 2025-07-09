import { Module } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { MedicalController } from './medical.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medical } from './entities/medical.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medical])],

  controllers: [MedicalController],
  providers: [MedicalService],
})
export class MedicalModule {}
