import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';


@Controller('patients')
export class PatientsController {
  constructor(@InjectRepository(Patient) private patientsRepository: Repository<Patient>,
              @InjectRepository(Users) private usersRepository: Repository<Users>) {}
        // Create a new patient linked to a User
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.patientsRepository
      .save(createPatientDto as any)
      .then((patient: Patient) => {
        return `Patient with ID ${patient.id} has been created`;
      })
      .catch((error) => {
        console.error('Error creating patient:', error);
        throw new Error('Failed to create patient');
      });
  }

  // Find all patients with user info
  @Get()
  async findAll() {
    return await this.patientsRepository.find({
      relations: ['user'], //LOAD user relation to access firstName, lastName, email
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
        },
      },
    });
  }
  // Find one patient by ID with user info
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.patientsRepository
      .findOne({
        where: { id: parseInt(id) },
        relations: ['user'], //LOAD user relation to access firstName, lastName, email
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
          },
        },
      })
      .then((patient) => {
        if (!patient) {
          return `No patient found with ID ${id}`;
        }
        return patient;
      })
      .catch((error) => {
        console.error('Error finding patient:', error);
        throw new Error(`Failed to find patient with ID ${id}`);
      });
  }
  // Update patient by ID (patient-specific fields only)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return await this.patientsRepository
      .update({ id: parseInt(id) },
        updatePatientDto,
      ) 
      .then(() => {
        return `Patient with ID ${id} has been updated`;
      })
      .catch((error) => {
        console.error('Error updating patient:', error);
        throw new Error(`Failed to update patient with ID ${id}`);
      });
  }
  // Delete a patient by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.patientsRepository
      .delete({ id: parseInt(id) })
      .then((result) => {
        if (result.affected === 0) {
          return `No patient found with ID ${id}`;
        }
        return `Patient with ID ${id} has been deleted`;
      })
      .catch((error) => {
        console.error('Error deleting patient:', error);
        throw new Error(`Failed to delete patient with ID ${id}`);
      });
  }
}