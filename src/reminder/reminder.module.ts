import { Module, forwardRef } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [forwardRef(() => AppointmentsModule)],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
