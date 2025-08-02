import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';
import { AppointmentsService } from '../appointments/appointments.service';
import { CronJob } from 'cron';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly appointmentService: AppointmentsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async scheduleReminders(appointmentId: number, appointmentDateTime: string, patientEmail: string) {
    const appointmentMoment = moment(appointmentDateTime);
    const oneDayBefore = appointmentMoment.clone().subtract(1, 'days');
    const oneHourBefore = appointmentMoment.clone().subtract(1, 'hours');

    await this.scheduleReminderJob(appointmentId, oneDayBefore.toDate(), '1 Day Reminder', patientEmail);
    await this.scheduleReminderJob(appointmentId, oneHourBefore.toDate(), '1 Hour Reminder', patientEmail);
  }

  private async scheduleReminderJob(
    appointmentId: number,
    time: Date,
    message: string,
    email: string,
  ) {
    const jobName = `reminder-${appointmentId}-${message.replace(/\s/g, '-')}`;
    const job = new CronJob(time, async () => {
      await this.sendReminder(email, message);
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`Executed and removed job: ${jobName}`);
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Scheduled ${message} for appointment ${appointmentId} at ${time}`);
  }

  private async sendReminder(email: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Appointment Reminder - ${message}`,
      text: `Hi, this is your reminder: ${message}.`,
    });

    this.logger.log(`Sent reminder to ${email}: ${message}`);
  }
}
