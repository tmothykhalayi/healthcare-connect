import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { ZoomService } from 'src/zoom/zoom.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PatientsModule,
    DoctorsModule,
    TypeOrmModule.forFeature([Appointment]),
    MailModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, ZoomService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
