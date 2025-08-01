import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './entities/slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorsService } from 'src/doctors/doctors.service';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
    private readonly doctorsService: DoctorsService,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const doctor = await this.doctorsService.findOne(createSlotDto.doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    const slot = this.slotRepository.create({
      date: createSlotDto.date,
      startTime: createSlotDto.startTime,
      endTime: createSlotDto.endTime,
      doctor,
      isAvailable: createSlotDto.isAvailable,
    });

    return this.slotRepository.save(slot);
  }

  findAll(): Promise<Slot[]> {
    return this.slotRepository.find();
  }

  async findOne(id: number): Promise<Slot> {
    const slot = await this.slotRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');
    return slot;
  }

  async update(id: number, updateSlotDto: UpdateSlotDto): Promise<Slot> {
    const slot = await this.findOne(id);

    if (updateSlotDto.doctorId) {
      const doctor = await this.doctorsService.findOne(updateSlotDto.doctorId);
      if (!doctor) throw new NotFoundException('Doctor not found');
      slot.doctor = doctor;
    }

    Object.assign(slot, updateSlotDto);
    return this.slotRepository.save(slot);
  }

  async remove(id: number): Promise<{ message: string }> {
    const slot = await this.findOne(id);
    await this.slotRepository.remove(slot);
    return { message: 'Slot removed successfully' };
  }
}
