import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Patient, Pharmacy])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
