import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Users } from '../users/entities/user.entity'; 

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  // Create a new patient linked to a User
  async create(createPatientDto: CreatePatientDto) {
    // Find the user by userId passed in DTO
    const user = await this.usersRepository.findOne({ where: { id: createPatientDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createPatientDto.userId} not found`);
    }

    // Check if patient for this user already exists
    const existingPatient = await this.patientsRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (existingPatient) {
      throw new ConflictException(`Patient record already exists for this user`);
    }

    // Create new patient entity linked to user
    const newPatient = this.patientsRepository.create({
      user,
      phoneNumber: createPatientDto.phoneNumber,
      address: createPatientDto.address,
      dateOfBirth: createPatientDto.dateOfBirth,
      medicalHistory: createPatientDto.medicalHistory,
    });

    try {
      return await this.patientsRepository.save(newPatient);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create patient');
    }
  }

  // Find all patients with user info
  async findAll() {
    return await this.patientsRepository.find({
      relations: ['user'], // eager-load user to access firstName, lastName, email
      select: {
        id: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        medicalHistory: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    });
  }

  // Find one patient by ID with user info
  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  // Update patient by ID (patient-specific fields only)
  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`No patient found with ID ${id}`);
    }
    Object.assign(patient, updatePatientDto);
    try {
      return await this.patientsRepository.save(patient);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update patient');
    }
  }

  // Delete a patient by ID
  async remove(id: string) {
    const result = await this.patientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No patient found with ID ${id}`);
    }
    return { message: `Patient with ID ${id} has been deleted` };
  }
}