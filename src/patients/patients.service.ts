import {Injectable,NotFoundException,InternalServerErrorException,ConflictException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, Gender } from './entities/patient.entity';
import { Users, UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Doctor) private doctorsRepository: Repository<Doctor>,
  ) {}

  // Create a new patient
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Check if patient already exists for this user
    const existingPatient = await this.patientsRepository.findOne({
      where: { userId: createPatientDto.userId },
    });

    if (existingPatient) {
      throw new ConflictException(
        `Patient profile already exists for user ID ${createPatientDto.userId}`,
      );
    }

    // Check if user exists and has the correct role
    // You might want to inject UsersService here to verify the user exists

    try {
      const patientData = {
        ...createPatientDto,
        dateOfBirth: createPatientDto.dateOfBirth
          ? new Date(createPatientDto.dateOfBirth)
          : undefined,
      };

      const newPatient = this.patientsRepository.create(patientData);
      const savedPatient = await this.patientsRepository.save(newPatient);

      const patient = await this.patientsRepository.findOne({
        where: { id: savedPatient.id },
        relations: ['user', 'assignedDoctor'],
      });

      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${savedPatient.id} not found`,
        );
      }

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);

      if (error.code === '23505') {
        throw new ConflictException(
          `Patient profile already exists for user ID ${createPatientDto.userId}`,
        );
      }

      if (error.code === '23503') {
        throw new BadRequestException(
          `User ID ${createPatientDto.userId} does not exist or assigned doctor ID is invalid`,
        );
      }

      throw new InternalServerErrorException(
        `Failed to create patient: ${error.message}`,
      );
    }
  }

  // Find all patients with user and order information
  async findAll(): Promise<Patient[]> {
    try {
      return await this.patientsRepository.find({
        relations: ['user', 'orders'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve patients');
    }
  }

  // Find one patient by ID with user and order information
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['user', 'orders'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  // Update patient
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<{ message: string }> {
    const patient = await this.patientsRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    Object.assign(patient, updatePatientDto);

    try {
      await this.patientsRepository.save(patient);
      return { message: `Patient with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update patient');
    }
  }

  // Delete patient
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.patientsRepository.delete({ id: parseInt(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return { message: `Patient with ID ${id} deleted successfully` };
  }

  // Add this method for automatic role assignment
  async createFromUser(user: Users): Promise<Patient> {
    // Check if patient record already exists
    const existingPatient = await this.patientsRepository.findOne({
      where: { userId: user.id },
    });

    if (existingPatient) {
      return existingPatient;
    }

    try {
      // Create patient with NO NULL values
      const patientData = {
        userId: user.id,
        firstName: user.firstName, // Add required firstName
        lastName: user.lastName,   // Add required lastName
        gender: Gender.OTHER, // Default gender enum value
        dateOfBirth: new Date('2000-01-01'), // Default date
        phoneNumber: user.phoneNumber || '(Not set)',
        address: 'Pending update',
        emergencyContact: 'Not provided',
        medicalHistory: '',
        allergies: [],
        bloodType: 'Unknown',
        weight: 0.0,
        height: 0.0,
        status: 'pending_profile_completion',
      };

      const newPatient = this.patientsRepository.create(patientData);
      const savedPatient = await this.patientsRepository.save(newPatient);

      return savedPatient;
    } catch (error) {
      console.error('Error creating patient from user:', error);
      throw new InternalServerErrorException(
        `Failed to create patient profile: ${error.message}`,
      );
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.patientsRepository.delete({ user: { id: userId } });
  }
}
