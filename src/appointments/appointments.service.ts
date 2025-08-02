import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Slot } from '../slots/entities/slot.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ConfigService } from '@nestjs/config';
import { ZoomService } from 'src/zoom/zoom.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';
import { MailService } from 'src/mail/mail.service';
import * as moment from 'moment';
import * as cron from 'node-cron';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,

    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,

    private configService: ConfigService,
    private zoomService: ZoomService,
    private doctorsService: DoctorsService,
    private patientsService: PatientsService,
    private mailService: MailService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, slotId, title, duration, date, time, reason } = createAppointmentDto;

    const patient = await this.patientsService.findOne(String(patientId));
    const doctor = await this.doctorsService.findOne(doctorId);
    if (!patient) throw new NotFoundException(`Patient with ID ${patientId} not found`);
    if (!doctor) throw new NotFoundException(`Doctor with ID ${doctorId} not found`);

    const slot = await this.slotsRepository.findOne({
      where: { id: slotId },
      relations: ['doctor'],
    });

    if (!slot) throw new NotFoundException(`Slot with ID ${slotId} not found`);
    if (slot.isBooked) throw new ConflictException(`Slot is already booked`);
    if (slot.doctor.id !== doctorId)
      throw new BadRequestException(`Slot does not belong to the selected doctor`);

    // Use the date and time from the DTO, or fall back to slot data
    const appointmentDate = date || slot.date;
    const appointmentTime = time || slot.startTime;
    const appointmentDateTime = `${appointmentDate}T${appointmentTime}`;
    
    const { start_url, join_url, meeting_id } = await this.zoomService.createMeeting(
      title,
      appointmentDateTime,
      duration,
    );

    const appointment = this.appointmentsRepository.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDateTime),
      appointmentTime,
      duration,
      reason,
      status: createAppointmentDto.status || 'scheduled',
      priority: createAppointmentDto.priority || 'normal',
      notes: createAppointmentDto.notes || '',
      medicalNotes: createAppointmentDto.medicalNotes || '',
      diagnosis: createAppointmentDto.diagnosis || '',
      prescription: createAppointmentDto.prescription || '',
      vitals: createAppointmentDto.vitals || {},
      patient,
      doctor,
      slot,
      user_url: join_url,
      admin_url: start_url,
      zoomMeetingId: meeting_id,
      patientEmail: patient.user.email,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });

    try {
      const savedAppointment = await this.appointmentsRepository.save(appointment);

      slot.isBooked = true;
      await this.slotsRepository.save(slot);

      await this.mailService.sendCustomMail({
        to: patient.user.email,
        subject: 'Your Appointment is Booked',
        template: 'appointment-notification',
        context: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: appointmentDateTime,
          meetingUrl: join_url,
          isDoctor: false,
        },
      });

      await this.mailService.sendCustomMail({
        to: doctor.user.email,
        subject: 'New Appointment Booked',
        template: 'appointment-notification',
        context: {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          patientName: `${patient.firstName} ${patient.lastName}`,
          appointmentDate: appointmentDateTime,
          meetingUrl: start_url,
          isDoctor: true,
        },
      });
      // Schedule reminders 1 day and 1 hour before appointment
      this.scheduleReminders(savedAppointment);

      return savedAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (appointment.id) {
        await this.appointmentsRepository.delete(appointment.id);
      }
      slot.isBooked = false;
      await this.slotsRepository.save(slot);
      throw new InternalServerErrorException(`Failed to create appointment: ${error.message}`);
    }
  }
  private scheduleReminders(appointment: Appointment) {
    const appointmentMoment = moment(appointment.appointmentDate);

    const oneDayBefore = appointmentMoment.clone().subtract(1, 'day');
    const oneHourBefore = appointmentMoment.clone().subtract(1, 'hour');

    if (oneDayBefore.isAfter(moment())) {
      // Schedule reminder 1 day before
      cron.schedule(this.convertMomentToCron(oneDayBefore), async () => {
        await this.sendReminderEmail(appointment, 'Reminder: Your appointment is tomorrow');
      });
    }

    if (oneHourBefore.isAfter(moment())) {
      // Schedule reminder 1 hour before
      cron.schedule(this.convertMomentToCron(oneHourBefore), async () => {
        await this.sendReminderEmail(appointment, 'Reminder: Your appointment is in one hour');
      });
    }
  }
  private convertMomentToCron(momentObj: moment.Moment): string {
    // Convert moment date to cron string format: 'm H D M *'
    // Note: Cron months are 1-12, moment months are 0-11, so add 1 to month
    return `${momentObj.minute()} ${momentObj.hour()} ${momentObj.date()} ${momentObj.month() + 1} *`;
  }

  private async sendReminderEmail(appointment: Appointment, subject: string) {
    try {
      await this.mailService.sendCustomMail({
        to: appointment.patientEmail,
        subject,
        template: 'appointment-reminder',
        context: {
          firstName: appointment.patientName,
          appointmentDate: moment(appointment.appointmentDate).format('YYYY-MM-DD HH:mm'),
          meetingUrl: appointment.user_url,
        },
      });
      console.log(`Sent reminder email to ${appointment.patientEmail} with subject "${subject}"`);
    } catch (error) {
      console.error('Failed to send reminder email:', error);
    }
  }

  async findAll() {
    return this.appointmentsRepository.find({
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findOne(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'slot'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async findAllPaginated(page = 1, limit = 10, search = '') {
    const query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('doctor.user', 'doctorUser');

    if (search) {
      query.where(
        'appointment.status LIKE :search OR appointment.reason LIKE :search OR appointment.title LIKE :search OR patientUser.firstName LIKE :search OR patientUser.lastName LIKE :search OR doctorUser.firstName LIKE :search OR doctorUser.lastName LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('appointment.appointmentDate', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
    };
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.update(id, updateAppointmentDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);

    if (appointment.slot) {
      appointment.slot.isBooked = false;
      await this.slotsRepository.save(appointment.slot);
    }

    return this.appointmentsRepository.delete(id);
  }

  async getAppointmentsForToday() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(startOfDay, endOfDay),
      },
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findToday() {
    return this.getAppointmentsForToday();
  }

  async findUpcoming() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const sevenDaysLater = new Date(startOfDay);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(startOfDay, sevenDaysLater),
      },
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findByStatus(status: string) {
    return this.appointmentsRepository.find({
      where: { status },
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findByPatientId(patientId: number) {
    return this.appointmentsRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findByDoctorId(doctorId: number) {
    return this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor', 'slot'],
    });
  }

  async findByCurrentDoctor(userId: number) {
    return this.findByDoctorId(userId);
  }
}
