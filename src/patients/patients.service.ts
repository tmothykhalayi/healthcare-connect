import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Users } from '../users/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
        @InjectRepository(Users) private usersRepository: Repository<Users>
    ) {}

    // Create a new patient
    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        // Check if user exists
        const user = await this.usersRepository.findOne({
            where: { id: createPatientDto.userId }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createPatientDto.userId} not found`);
        }

        // Check if patient already exists for this user
        const existingPatient = await this.patientsRepository.findOne({
            where: { userId: createPatientDto.userId }
        });

        if (existingPatient) {
            throw new ConflictException(`Patient profile already exists for user ${createPatientDto.userId}`);
        }

        const newPatient = this.patientsRepository.create(createPatientDto);

        try {
            return await this.patientsRepository.save(newPatient);
        } catch (error) {
            console.error('Database error:', error);
            throw new InternalServerErrorException('Failed to create patient');
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
    async update(id: string, updatePatientDto: UpdatePatientDto): Promise<{ message: string }> {
        const patient = await this.patientsRepository.findOne({ where: { id: parseInt(id) } });
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
}