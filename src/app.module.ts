import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './logger.middleware';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SlotsModule } from './slots/slots.module';
import { ReminderModule } from './reminder/reminder.module';

// Business Modules
import { AdminModule } from './admin/admin.module';
import { MedicalModule } from './records/medical/medical.module';
import { MedicinesModule } from './medicines/medicines.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { PharmacistModule } from './pharmacist/pharmacist.module';
import { AvailabilityModule } from './availability/availability.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { LogsModule } from './logs/logs.module';
import { DatabaseModule } from './database/database.module';
import { ZoomService } from './zoom/zoom.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 1000,
    }),
    CacheModule.register(), // Optional, for caching if needed
    ScheduleModule.forRoot(),

    // Core Features
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    SlotsModule,
    ReminderModule,

    // Business Logic
    AdminModule,
    MedicalModule,
    MedicinesModule,
    OrdersModule,
    PaymentsModule,
    PharmacyModule,
    PharmacistModule,
    AvailabilityModule,
    MailModule,
    ChatModule,
    LogsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ZoomService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
