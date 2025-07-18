import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTelemedicineDto } from './dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from './dto/update-telemedicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { TelemedicineAppointment } from './entities/telemedicine.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Medical } from '../records/medical/entities/medical.entity';

@Injectable()
export class TelemedicineService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(TelemedicineAppointment)
    private telemedicineRepo: Repository<TelemedicineAppointment>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Medical)
    private medicalRepo: Repository<Medical>,
  ) {}

  // Create telemedicine appointment with checks
  async createAppointment(
    dto: CreateTelemedicineDto,
  ): Promise<TelemedicineAppointment> {
    // Find patient and doctor by ID
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Construct scheduledAt from appointmentDate and appointmentTime
    if (!dto.appointmentDate || !dto.appointmentTime) {
      throw new BadRequestException(
        'appointmentDate and appointmentTime are required',
      );
    }
    const scheduledAt = new Date(
      `${dto.appointmentDate}T${dto.appointmentTime}:00Z`,
    );
    if (isNaN(scheduledAt.getTime())) {
      throw new BadRequestException(
        'Invalid appointmentDate or appointmentTime',
      );
    }

    // Check if doctor is available at scheduledAt time
    const existingAppt = await this.telemedicineRepo.findOne({
      where: {
        doctor: { id: dto.doctorId },
        scheduledAt: scheduledAt,
      },
      relations: ['doctor'],
    });

    if (existingAppt) {
      throw new BadRequestException(
        `Doctor is not available at ${scheduledAt.toISOString()}`,
      );
    }

    // Create new TelemedicineAppointment entity
    const appointment = this.telemedicineRepo.create({
      scheduledAt,
      status: dto.status || 'scheduled',
      appointmentTime: dto.appointmentTime,
      duration: dto.duration,
      notes: dto.notes,
    });

    // Set relations after creation if needed
    appointment.patient = patient;
    appointment.doctor = doctor;

    // Save and return the appointment
    return this.telemedicineRepo.save(appointment);
  }

  // Get all telemedicine appointments
  async findAllAppointments(): Promise<any[]> {
    const appointments = await this.telemedicineRepo.find({
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
      order: { scheduledAt: 'DESC' },
    });

    // Return appointments with limited user details
    return appointments.map((appointment) => ({
      ...appointment,
      doctor: appointment.doctor
        ? {
            id: appointment.doctor.id,
            firstName: appointment.doctor.user?.firstName,
            lastName: appointment.doctor.user?.lastName,
            specialization: appointment.doctor.specialization,
          }
        : null,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            firstName: appointment.patient.user?.firstName,
            lastName: appointment.patient.user?.lastName,
            dateOfBirth: appointment.patient.dateOfBirth,
          }
        : null,
    }));
  }

  // Get appointment by ID
  async findAppointmentById(id: number): Promise<any> {
    const appointment = await this.telemedicineRepo.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Return appointment with limited user details
    return {
      ...appointment,
      doctor: appointment.doctor
        ? {
            id: appointment.doctor.id,
            firstName: appointment.doctor.user?.firstName,
            lastName: appointment.doctor.user?.lastName,
            specialization: appointment.doctor.specialization,
          }
        : null,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            firstName: appointment.patient.user?.firstName,
            lastName: appointment.patient.user?.lastName,
            dateOfBirth: appointment.patient.dateOfBirth,
          }
        : null,
    };
  }

  // Update appointment
  async updateAppointment(
    id: number,
    dto: UpdateTelemedicineDto,
  ): Promise<TelemedicineAppointment> {
    const appointment = await this.telemedicineRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (dto.patientId) {
      const patient = await this.patientRepo.findOne({
        where: { id: dto.patientId },
      });
      if (!patient) throw new NotFoundException('Patient not found');
      appointment.patient = patient;
    }

    if (dto.doctorId) {
      const doctor = await this.doctorRepo.findOne({
        where: { id: dto.doctorId },
      });
      if (!doctor) throw new NotFoundException('Doctor not found');
      appointment.doctor = doctor;
    }

    // Check if doctor is available at the new scheduledAt or appointmentTime
    if (dto.scheduledAt || dto.appointmentTime) {
      const scheduledAt = dto.scheduledAt
        ? new Date(dto.scheduledAt)
        : appointment['scheduledAt'];
      const existingAppt = await this.telemedicineRepo.findOne({
        where: {
          doctor: {
            id: dto.doctorId || (appointment.doctor && appointment.doctor.id),
          },
          scheduledAt: scheduledAt,
        },
      });
      if (existingAppt && existingAppt.id !== id) {
        throw new BadRequestException(
          `Doctor is not available at ${scheduledAt.toISOString()}`,
        );
      }
    }

    if (dto.scheduledAt !== undefined) {
      appointment.scheduledAt = new Date(dto.scheduledAt);
    }
    if (dto.appointmentTime !== undefined) {
      appointment.appointmentTime = dto.appointmentTime;
    }
    if (dto.duration !== undefined) {
      appointment.duration = dto.duration;
    }
    if (dto.status !== undefined) {
      appointment.status = dto.status;
    }
    if (dto.notes !== undefined) {
      appointment.notes = dto.notes;
    }
    return this.telemedicineRepo.save(appointment);
  }

  // Delete appointment
  async deleteAppointment(id: number): Promise<void> {
    const appointment = await this.telemedicineRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.telemedicineRepo.remove(appointment);
  }

  // Get appointments by patient
  async findAppointmentsByPatient(patientId: number): Promise<any[]> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const appointments = await this.telemedicineRepo.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
      order: { scheduledAt: 'DESC', appointmentTime: 'DESC' },
    });

    // Return appointments with limited user details
    return appointments.map((appointment) => ({
      ...appointment,
      doctor: appointment.doctor
        ? {
            id: appointment.doctor.id,
            firstName: appointment.doctor.user?.firstName,
            lastName: appointment.doctor.user?.lastName,
            specialization: appointment.doctor.specialization,
          }
        : null,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            firstName: appointment.patient.user?.firstName,
            lastName: appointment.patient.user?.lastName,
            dateOfBirth: appointment.patient.dateOfBirth,
          }
        : null,
    }));
  }

  // Get appointments by doctor
  async findAppointmentsByDoctor(doctorId: number): Promise<any[]> {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const appointments = await this.telemedicineRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
      order: { scheduledAt: 'DESC', appointmentTime: 'DESC' },
    });

    // Return appointments with limited user details
    return appointments.map((appointment) => ({
      ...appointment,
      doctor: appointment.doctor
        ? {
            id: appointment.doctor.id,
            firstName: appointment.doctor.user?.firstName,
            lastName: appointment.doctor.user?.lastName,
            specialization: appointment.doctor.specialization,
          }
        : null,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            firstName: appointment.patient.user?.firstName,
            lastName: appointment.patient.user?.lastName,
            dateOfBirth: appointment.patient.dateOfBirth,
          }
        : null,
    }));
  }

  // Get telemedicine statistics
  async getTelemedicineStats(): Promise<any> {
    const totalAppointments = await this.telemedicineRepo.count();
    const scheduledAppointments = await this.telemedicineRepo.count({
      where: { status: 'scheduled' },
    });
    const completedAppointments = await this.telemedicineRepo.count({
      where: { status: 'completed' },
    });
    const cancelledAppointments = await this.telemedicineRepo.count({
      where: { status: 'cancelled' },
    });

    // Get appointments by date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await this.telemedicineRepo.count({
      where: {
        scheduledAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // Get unique patients and doctors
    const uniquePatients = await this.telemedicineRepo
      .createQueryBuilder('appointment')
      .select('DISTINCT appointment.patientId', 'patientId')
      .getRawMany();

    const uniqueDoctors = await this.telemedicineRepo
      .createQueryBuilder('appointment')
      .select('DISTINCT appointment.doctorId', 'doctorId')
      .getRawMany();

    return {
      total: totalAppointments,
      scheduled: scheduledAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      recent: recentAppointments,
      uniquePatients: uniquePatients.length,
      uniqueDoctors: uniqueDoctors.length,
      completionRate:
        totalAppointments > 0
          ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
          : 0,
    };
  }
}
