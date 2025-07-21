import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ZoomService } from 'src/zoom/zoom.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private configService: ConfigService,
    private zoomService: ZoomService,
    private doctorsService: DoctorsService,
    private patientsService: PatientsService,
    private mailService: MailService, // Inject MailService
  ) {}

  // Create a new appointment
  async create(createAppointmentDto: CreateAppointmentDto) {
    const patient = await this.patientsService.findOne(
      String(createAppointmentDto.patientId),
    );
    const doctor = await this.doctorsService.findOne(
      createAppointmentDto.doctorId,
    );
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createAppointmentDto.patientId} not found`,
      );
    }
    if (!doctor) {
      throw new NotFoundException(
        `Doctor with ID ${createAppointmentDto.doctorId} not found`,
      );
    }

    // Combine date and time into ISO string for Zoom and entity
    // Prefer appointmentDate if present, else combine date and time
    let appointmentDateTime: string;
    if (createAppointmentDto.appointmentDate) {
      appointmentDateTime = createAppointmentDto.appointmentDate;
    } else if (createAppointmentDto.date && createAppointmentDto.time) {
      appointmentDateTime = `${createAppointmentDto.date}T${createAppointmentDto.time}`;
    } else {
      throw new ConflictException('Appointment date and time are required');
    }

    const { start_url, join_url, meeting_id } =
      await this.zoomService.createMeeting(
        createAppointmentDto.title,
        appointmentDateTime,
        createAppointmentDto.duration,
      );

    console.log('Zoom meeting created at appointment service:', {
      start_url,
      join_url,
      meeting_id,
    });

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      appointmentDate: new Date(appointmentDateTime),
      patient: patient,
      doctor: doctor,
      user_url: join_url,
      admin_url: start_url,
      zoomMeetingId: meeting_id,
    });

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    // Book the time slot
    try {
      await this.doctorsService.bookTimeSlot(
        createAppointmentDto.doctorId,
        createAppointmentDto.date ||
          createAppointmentDto.appointmentDate?.split('T')[0],
        createAppointmentDto.time ||
          createAppointmentDto.appointmentDate?.split('T')[1]?.substring(0, 5),
        savedAppointment.id,
      );
    } catch (error) {
      await this.appointmentsRepository.delete(savedAppointment.id);
      throw new NotFoundException('Time slot not available');
    }

    // Send emails to patient and doctor, but do not fail booking if email fails
    try {
      // Send email to patient
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
      // Send email to doctor
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
    } catch (emailError) {
      // Log the error but do not delete the appointment
      if (this['logger']) {
        this['logger'].error('Failed to send appointment email:', emailError);
      } else {
        console.error('Failed to send appointment email:', emailError);
      }
    }

    return savedAppointment;
  }

  findAll() {
    return this.appointmentsRepository.find({
      relations: ['patient', 'doctor'],
    });
  }

  // Get all appointments with pagination and search
  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Appointment[]; total: number }> {
    console.log(
      `[AppointmentsService] Fetching appointments - page: ${page}, limit: ${limit}, search: "${search}"`,
    );

    const query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
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

    console.log(
      `[AppointmentsService] Found ${data.length} appointments out of ${total} total`,
    );
    console.log(
      '[AppointmentsService] Sample appointment data:',
      data.length > 0
        ? {
            id: data[0].id,
            patientId: data[0].patientId,
            doctorId: data[0].doctorId,
            appointmentDate: data[0].appointmentDate,
            status: data[0].status,
            reason: data[0].reason,
            patientName: data[0].patient
              ? `${data[0].patient.user?.firstName || ''} ${data[0].patient.user?.lastName || ''}`.trim()
              : '',
            doctorName: data[0].doctor
              ? `${data[0].doctor.user?.firstName || ''} ${data[0].doctor.user?.lastName || ''}`.trim()
              : '',
          }
        : 'No appointments found',
    );

    return { data, total };
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    console.log(
      `[AppointmentsService] Updating appointment ${id} with data:`,
      updateAppointmentDto,
    );

    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    console.log(`[AppointmentsService] Found existing appointment:`, {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      reason: appointment.reason,
    });

    const result = await this.appointmentsRepository.update(
      id,
      updateAppointmentDto,
    );
    console.log(`[AppointmentsService] Update result:`, result);

    return result;
  }

  async remove(id: number) {
    // Release the time slot when appointment is cancelled
    await this.doctorsService.releaseTimeSlot(id);
    return this.appointmentsRepository.delete(id);
  }

  // Method to get appointments for today
  async getAppointmentsForToday() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(startOfDay, endOfDay),
      },
      relations: ['patient', 'doctor'],
    });
  }

  async findByCurrentDoctor(userId: number) {
    // Assuming doctorId is the same as userId for doctors
    return this.appointmentsRepository.find({
      where: { doctorId: userId },
      relations: ['patient', 'doctor'],
    });
  }

  async findByDoctorId(doctorId: number) {
    return this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor'],
    });
  }

  async findToday() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    return this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(startOfDay, endOfDay),
      },
      relations: ['patient', 'doctor'],
    });
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
      relations: ['patient', 'doctor'],
    });
  }

  async findByStatus(status: string) {
    return this.appointmentsRepository.find({
      where: { status },
      relations: ['patient', 'doctor'],
    });
  }

  async findByPatientId(patientId: number) {
    return this.appointmentsRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor'],
    });
  }

  //fetch user b patientid
}
