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
    console.log(
      `[DoctorsService] Updating doctor ${id} with data:`,
      updateDoctorDto,
    );

    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    console.log(`[DoctorsService] Found existing doctor:`, {
      id: doctor.id,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    });

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

    console.log('Incoming updateDoctorDto:', updateDoctorDto);
    Object.assign(doctor, updateDoctorDto);
    console.log('Doctor entity before save:', doctor);

    try {
      const savedDoctor = await this.doctorsRepository.save(doctor);
      console.log('Doctor entity after save:', {
        id: savedDoctor.id,
        specialization: savedDoctor.specialization,
        licenseNumber: savedDoctor.licenseNumber,
        consultationFee: savedDoctor.consultationFee,
        availableDays: savedDoctor.availableDays,
      });
      return { message: `Doctor with ID ${id} updated successfully` };
    } catch (error) {
      console.error('Update doctor error:', error);
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

  // Stub for booking a time slot (implement actual logic as needed)
  async bookTimeSlot(
    doctorId: number,
    date: string,
    time: string,
    appointmentId: number,
  ): Promise<void> {
    // TODO: Implement actual time slot booking logic
    // For now, just resolve (simulate success)
    return;
  }

  // Stub for releasing a time slot (implement actual logic as needed)
  async releaseTimeSlot(appointmentId: number): Promise<void> {
    // TODO: Implement actual time slot release logic
    // For now, just resolve (simulate success)
    return;
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Doctor[]; total: number }> {
    console.log(
      `[DoctorsService] Fetching doctors - page: ${page}, limit: ${limit}, search: "${search}"`,
    );

    const query = this.doctorsRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.patients', 'patients');

    if (search) {
      query.where(
        'doctor.specialization LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    console.log(
      `[DoctorsService] Found ${data.length} doctors out of ${total} total`,
    );
    console.log(
      '[DoctorsService] Sample doctor data:',
      data.length > 0
        ? {
            id: data[0].id,
            specialization: data[0].specialization,
            licenseNumber: data[0].licenseNumber,
            consultationFee: data[0].consultationFee,
            availableDays: data[0].availableDays,
          }
        : 'No doctors found',
    );

    return { data, total };
  }

  //get patient by doctor ID
  async findPatientsByDoctorId(doctorId: number): Promise<Users[]> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
      relations: ['patients'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return doctor.patients.map((patient) => patient.user);
  }

  // Find doctor by userId
  async findByUserId(userId: number): Promise<Doctor | null> {
    return this.doctorsRepository.findOne({ where: { userId } });
  }
}
