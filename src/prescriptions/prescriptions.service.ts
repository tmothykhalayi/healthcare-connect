import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const doctor = await this.doctorRepo.findOneOrFail({
      where: { id: Number(dto.doctorId) },
    });
    const patient = await this.patientRepo.findOneOrFail({
      where: { id: Number(dto.patientId) },
    });

    const prescription = this.prescriptionRepo.create({
      diagnosis: dto.diagnosis,
      medication: dto.medication,
      dosageInstructions: dto.dosageInstructions,
      doctor,
      patient,
    });

    return this.prescriptionRepo.save(prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepo.find({
      relations: ['doctor', 'patient'],
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({ where: { id } });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (dto.doctorId) {
      prescription.doctor = await this.doctorRepo.findOneOrFail({
        where: { id: Number(dto.doctorId) },
      });
    }

    if (dto.patientId) {
      prescription.patient = await this.patientRepo.findOneOrFail({
        where: { id: Number(dto.patientId) },
      });
    }

    if (dto.diagnosis) prescription.diagnosis = dto.diagnosis;
    if (dto.medication) prescription.medication = dto.medication;
    if (dto.dosageInstructions !== undefined) {
      prescription.dosageInstructions = dto.dosageInstructions;
    }

    return this.prescriptionRepo.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const result = await this.prescriptionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Prescription not found');
    }
  }
}
