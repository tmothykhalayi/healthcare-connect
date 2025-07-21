import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity';
import { PharmacyMedicine } from '../pharmacy/entities/pharmacy-medicine.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Patient, 
      Pharmacy,
       PharmacyMedicine
      ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
