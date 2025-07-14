import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Availability, AvailabilityStatus, AvailabilityType } from './entities/availability.entity';
import { CreateAvailabilityDto, FrontendAvailabilityType } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto, doctorId: number): Promise<Availability> {
    const { startTime, endTime, type } = createAvailabilityDto;
    
    // Check for time conflicts
    const conflictingSlots = await this.availabilityRepository.find({
      where: {
        doctorId,
        startTime: Between(new Date(startTime), new Date(endTime)),
        status: AvailabilityStatus.AVAILABLE,
      },
    });

    if (conflictingSlots.length > 0) {
      throw new BadRequestException('Time slot conflicts with existing availability');
    }

    // Map frontend type to backend type
    let backendType = AvailabilityType.REGULAR;
    if (type === FrontendAvailabilityType.EMERGENCY) {
      backendType = AvailabilityType.EMERGENCY;
    }

    const availability = this.availabilityRepository.create({
      doctorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type: backendType,
      notes: createAvailabilityDto.notes,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAll(): Promise<Availability[]> {
    return this.availabilityRepository.find({
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }

  async findByDoctorId(doctorId: number): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { doctorId },
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }

  async findAvailableSlotsForDoctor(doctorId: number): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: {
        doctorId,
        status: AvailabilityStatus.AVAILABLE,
        startTime: MoreThanOrEqual(new Date()),
      },
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: {
        startTime: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new NotFoundException(`Availability slot with ID ${id} not found`);
    }

    return availability;
  }

  async update(id: number, updateAvailabilityDto: UpdateAvailabilityDto): Promise<Availability> {
    const availability = await this.findOne(id);
    
    // Check for time conflicts if time is being updated
    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
      const startTime = updateAvailabilityDto.startTime ? new Date(updateAvailabilityDto.startTime) : availability.startTime;
      const endTime = updateAvailabilityDto.endTime ? new Date(updateAvailabilityDto.endTime) : availability.endTime;
      
      const conflictingSlots = await this.availabilityRepository.find({
        where: {
          doctorId: availability.doctorId,
          id: Not(id), // Exclude current slot
          startTime: Between(startTime, endTime),
          status: AvailabilityStatus.AVAILABLE,
        },
      });

      if (conflictingSlots.length > 0) {
        throw new BadRequestException('Time slot conflicts with existing availability');
      }
    }

    // Map frontend type to backend type if provided
    if (updateAvailabilityDto.type) {
      let backendType = AvailabilityType.REGULAR;
      if (updateAvailabilityDto.type === FrontendAvailabilityType.EMERGENCY) {
        backendType = AvailabilityType.EMERGENCY;
      }
      availability.type = backendType;
    }

    // Update other fields
    if (updateAvailabilityDto.startTime) {
      availability.startTime = new Date(updateAvailabilityDto.startTime);
    }
    if (updateAvailabilityDto.endTime) {
      availability.endTime = new Date(updateAvailabilityDto.endTime);
    }
    if (updateAvailabilityDto.notes !== undefined) {
      availability.notes = updateAvailabilityDto.notes;
    }

    return this.availabilityRepository.save(availability);
  }

  async remove(id: number): Promise<void> {
    const availability = await this.findOne(id);
    await this.availabilityRepository.remove(availability);
  }

  async markAsBooked(id: number): Promise<Availability> {
    const availability = await this.findOne(id);
    availability.status = AvailabilityStatus.BOOKED;
    return this.availabilityRepository.save(availability);
  }

  async markAsAvailable(id: number): Promise<Availability> {
    const availability = await this.findOne(id);
    availability.status = AvailabilityStatus.AVAILABLE;
    return this.availabilityRepository.save(availability);
  }

  async getAvailableSlotsByDateRange(startDate: string, endDate: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: {
        startTime: Between(new Date(startDate), new Date(endDate)),
        status: AvailabilityStatus.AVAILABLE,
      },
      relations: ['doctor'],
      order: { startTime: 'ASC' },
    });
  }
} 