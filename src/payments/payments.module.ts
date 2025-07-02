import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    UsersModule, // Add this line to import UsersModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
