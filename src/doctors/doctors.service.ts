import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { Users, UserRole } from '../users/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  // Create a new doctor
  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if user exists
    const user = await this.usersRepository.findOne({
      where: { id: createDoctorDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createDoctorDto.userId} not found`,
      );
    }

    // Check if doctor already exists for this user
    const existingDoctor = await this.doctorsRepository.findOne({
      where: { userId: createDoctorDto.userId },
    });

    if (existingDoctor) {
      throw new ConflictException(
        `Doctor profile already exists for user ${createDoctorDto.userId}`,
      );
    }

    // Check if license number already exists
    const existingLicense = await this.doctorsRepository.findOne({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });

    if (existingLicense) {
      throw new ConflictException(
        `Doctor with license number ${createDoctorDto.licenseNumber} already exists`,
      );
    }

    const newDoctor = this.doctorsRepository.create(createDoctorDto);

    try {
      return await this.doctorsRepository.save(newDoctor);
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to create doctor');
    }
  }

  // Find all doctors with user and patient information
  async findAll(): Promise<Doctor[]> {
    try {
      return await this.doctorsRepository.find({
        relations: ['user', 'patients'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve doctors');
    }
  }

  // Find one doctor by ID with user and patient information
  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['user', 'patients'],
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  // Update doctor
  async update(
    id: number,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<{ message: string }> {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    // Check if license number is being updated and if it already exists
    if (
      updateDoctorDto.licenseNumber &&
      updateDoctorDto.licenseNumber !== doctor.licenseNumber
    ) {
      const existingLicense = await this.doctorsRepository.findOne({
        where: { licenseNumber: updateDoctorDto.licenseNumber },
      });
      if (existingLicense) {
        throw new ConflictException(
          `Doctor with license number ${updateDoctorDto.licenseNumber} already exists`,
        );
      }
    }

    Object.assign(doctor, updateDoctorDto);

    try {
      await this.doctorsRepository.save(doctor);
      return { message: `Doctor with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update doctor');
    }
  }

  // Delete doctor
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.doctorsRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return { message: `Doctor with ID ${id} deleted successfully` };
  }

  // Add this method for automatic role assignment
  async createFromUser(user: Users): Promise<Doctor> {
    // Check if doctor record already exists
    const existingDoctor = await this.doctorsRepository.findOne({
      where: { userId: user.id },
    });

    if (existingDoctor) {
      return existingDoctor;
    }

    try {
      // Create doctor with NO NULL values
      const doctorData = {
        userId: user.id,
        firstName: user.firstName, // Add required firstName
        lastName: user.lastName, // Add required lastName
        specialization: 'General Practice',
        licenseNumber: `TEMP_${user.id}_${Date.now().toString().slice(-6)}`,
        yearsOfExperience: 0,
        education: 'Pending verification',
        phoneNumber: user.phoneNumber || '(Not set)',
        officeAddress: 'Pending update',
        consultationFee: 0.0,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableHours: '9:00 AM - 5:00 PM',
        bio: 'New doctor profile',
        status: 'pending_verification',
      };

      const newDoctor = this.doctorsRepository.create(doctorData);
      const savedDoctor = await this.doctorsRepository.save(newDoctor);

      return savedDoctor;
    } catch (error) {
      console.error('Error creating doctor from user:', error);
      throw new InternalServerErrorException(
        `Failed to create doctor profile: ${error.message}`,
      );
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.doctorsRepository.delete({ user: { id: userId } });
  }
}
