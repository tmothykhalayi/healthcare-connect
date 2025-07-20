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

  findOne(id: number) {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.appointmentsRepository.update(id, updateAppointmentDto);
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
