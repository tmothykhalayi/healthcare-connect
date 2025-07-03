import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  // Create a new appointment
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Check for scheduling conflicts
    const appointmentDate = new Date(createAppointmentDto.appointmentDate);
    const duration = createAppointmentDto.duration;
    const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);

    const existingAppointment = await this.appointmentsRepository.findOne({
      where: {
        doctorId: createAppointmentDto.doctorId,
        appointmentDate: Between(
          new Date(appointmentDate.getTime() - duration * 60000),
          appointmentEnd
        ),
        status: Not('cancelled') // Don't check against cancelled appointments
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        `Doctor is not available at ${createAppointmentDto.appointmentDate}. Conflicting appointment exists.`
      );
    }

    const newAppointment = this.appointmentsRepository.create({
      patientId: createAppointmentDto.patientId,
      doctorId: createAppointmentDto.doctorId,
      appointmentDate: appointmentDate,
      appointmentTime: createAppointmentDto.appointmentTime,
      duration: createAppointmentDto.duration,
      reason: createAppointmentDto.reason,
      status: createAppointmentDto.status || 'scheduled',
      priority: createAppointmentDto.priority || 'normal',
      parentAppointmentId: createAppointmentDto.parentAppointmentId,
      notes: createAppointmentDto.notes
    });

    try {
      return await this.appointmentsRepository.save(newAppointment);
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to create appointment');
    }
  }

  // Find all appointments
  async findAll(): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentsRepository.find({
        relations: ['doctor', 'patient'],
        order: { appointmentDate: 'ASC' },
      });
      
      // Return appointments with limited user details
      return appointments.map(appointment => ({
        ...appointment,
        doctor: appointment.doctor ? {
          id: appointment.doctor.id,
          firstName: appointment.doctor.firstName,
          lastName: appointment.doctor.lastName,
          specialization: appointment.doctor.specialization
        } : null,
        patient: appointment.patient ? {
          id: appointment.patient.id,
          firstName: appointment.patient.firstName,
          lastName: appointment.patient.lastName,
          dateOfBirth: appointment.patient.dateOfBirth
        } : null
      }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve appointments');
    }
  }

  // Find one appointment by ID
  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    // Return appointment with limited user details
    return {
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    };
  }

  // Update appointment
  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<{ message: string }> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Check for conflicting appointment if date/time is being updated
    if (updateAppointmentDto.appointmentDate) {
      const appointmentDate = new Date(updateAppointmentDto.appointmentDate);
      const duration = updateAppointmentDto.duration || appointment.duration;
      const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);
      const doctorId = updateAppointmentDto.doctorId || appointment.doctorId;

      const conflictingAppointment = await this.appointmentsRepository.findOne({
        where: {
          doctorId: doctorId,
          appointmentDate: Between(
            new Date(appointmentDate.getTime() - duration * 60000),
            appointmentEnd
          ),
          status: Not('cancelled'),
          id: Not(id), // Exclude current appointment
        },
      });
      
      if (conflictingAppointment) {
        throw new ConflictException(
          `Doctor is not available at ${updateAppointmentDto.appointmentDate}. Conflicting appointment exists.`
        );
      }
    }

    // Update appointment fields
    const updateData = {
      ...updateAppointmentDto,
      ...(updateAppointmentDto.appointmentDate && {
        appointmentDate: new Date(updateAppointmentDto.appointmentDate)
      })
    };

    Object.assign(appointment, updateData);

    try {
      await this.appointmentsRepository.save(appointment);
      return { message: `Appointment with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update appointment');
    }
  }

  // Get appointments by doctor id
  async findByDoctorId(doctorId: number): Promise<Appointment[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['doctor', 'patient'],
      order: { appointmentDate: 'ASC' },
    });
    
    // Return appointments with limited user details
    return appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    }));
  }

  // Get appointments by patient id
  async findByPatientId(patientId: number): Promise<Appointment[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { patientId },
      relations: ['doctor', 'patient'],
      order: { appointmentDate: 'ASC' },
    });
    
    // Return appointments with limited user details
    return appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    }));
  }

  // Get appointments by status
  async findByStatus(status: string): Promise<Appointment[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { status },
      relations: ['doctor', 'patient'],
      order: { appointmentDate: 'ASC' },
    });
    
    // Return appointments with limited user details
    return appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    }));
  }

  // Get today's appointments
  async findToday(): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const appointments = await this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(startOfDay, endOfDay)
      },
      relations: ['doctor', 'patient'],
      order: { appointmentDate: 'ASC' },
    });
    
    // Return appointments with limited user details
    return appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    }));
  }

  // Get upcoming appointments (next 7 days)
  async findUpcoming(): Promise<Appointment[]> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appointments = await this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(today, nextWeek),
        status: Not('cancelled')
      },
      relations: ['doctor', 'patient'],
      order: { appointmentDate: 'ASC' },
    });
    
    // Return appointments with limited user details
    return appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        specialization: appointment.doctor.specialization
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        dateOfBirth: appointment.patient.dateOfBirth
      } : null
    }));
  }

  // Delete appointment
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.appointmentsRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return { message: `Appointment with ID ${id} deleted successfully` };
  }
}
