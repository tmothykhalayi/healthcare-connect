import { Injectable ,NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorsService {
    constructor (
        @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    ){}
    async create (CreateDoctorDto: CreateDoctorDto) {
        const existingDoctor = await this.doctorRepository.findOne({
            where: { licenseNumber: CreateDoctorDto.licenseNumber },
        });
        if (existingDoctor) {
            throw new NotFoundException(
                `Doctor with license number ${CreateDoctorDto.licenseNumber} already exists`,
            );
        }

        // Create a new Doctor entity
        const newDoctor = this.doctorRepository.create({

            userId: CreateDoctorDto.userId,
            specialisation: CreateDoctorDto.specialisation,
            licenseNumber: CreateDoctorDto.licenseNumber,
            experienceYears: CreateDoctorDto.experienceYears,
            bio: CreateDoctorDto.bio,
        });
        // Save the new doctor to the database
        return await this.doctorRepository.save(newDoctor);
    }

    //find all doctors
    async findAll($specialisation?: string) {
        if ($specialisation) {
            return await this.doctorRepository.find({
                where: { specialisation: $specialisation },
            });
        }
        return await this.doctorRepository.find(
            {
                //doctors name 
                select: ['id', 'userId', 'specialisation', 'licenseNumber', 'experienceYears', 'bio'],
            
                relations: ['users :true'],
            }
        );
    }
    
    //find one doctor
    async findOne(licenseNumber: string) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { licenseNumber },
                relations: ['users'],
            });
            if (!doctor) {
                throw new NotFoundException(`Doctor with id ${licenseNumber} not found`);
            }
            return doctor;
        } catch (error) {
            console.error('Error finding doctor:', error);
            throw new Error(`Failed to find student with licenseNumber ${licenseNumber}`);
        }
    }

// Update a doctor's details
async update (licenseNumber: string, updateDoctorDto: UpdateDoctorDto) {
    return await this.doctorRepository
        .update(licenseNumber, updateDoctorDto)
        .then((result) => {
            if (result.affected === 0) {
            return `No doctor found with license number ${licenseNumber}`;
            }
        })
        .catch((error) => {
            console.error('Error updating doctor:', error);
            throw new Error(`Failed to update doctor with license number ${licenseNumber}`);
        });
}

//delete a doctor 
async delete (licenseNumber: string) {
        return await this.doctorRepository
            .delete(licenseNumber)
            .then((result) => {
                if (result.affected === 0) {
                    return `No doctor found with license number ${licenseNumber}`;
                }
                return `Doctor with license number ${licenseNumber} has been removed`;
            })
            .catch((error) => {
                console.error('Error removing doctor:', error);
                throw new Error(`Failed to remove doctor with license number ${licenseNumber}`);
            });
    }
}
