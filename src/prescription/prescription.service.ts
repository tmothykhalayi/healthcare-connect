import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacist } from '../pharmacist/entities/pharmacist.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Pharmacist)
    private readonly pharmacistRepo: Repository<Pharmacist>,

    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
    });
    const medicines = await this.medicineRepo.findBy({
      id: In(dto.medicineIds),
    });

    if (!doctor || !patient || medicines.length !== dto.medicineIds.length) {
      throw new NotFoundException('Doctor, Patient or Medicines not found');
    }

    const prescription = this.prescriptionRepo.create({
      doctor,
      patient,
      medicines,
      issueDate: dto.issueDate || new Date(),
    });

    return this.prescriptionRepo.save(prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepo.find({
      relations: ['doctor', 'patient', 'pharmacist', 'medicines'],
    });
  }

  // Get all prescriptions with pagination and search
  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Prescription[]; total: number }> {
    const query = this.prescriptionRepo
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.doctor', 'doctor')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('prescription.pharmacist', 'pharmacist')
      .leftJoinAndSelect('prescription.medicines', 'medicines');

    if (search) {
      query.where(
        'prescription.notes LIKE :search OR prescription.status LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('prescription.issueDate', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'pharmacist', 'medicines'],
    });
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async update(id: number, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({ where: { id } });
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (dto.pharmacistId) {
      const pharmacist = await this.pharmacistRepo.findOne({
        where: { id: dto.pharmacistId },
      });
      if (!pharmacist) {
        throw new NotFoundException('Pharmacist not found');
      }
      prescription.pharmacist = pharmacist;
    }

    if (dto.fulfilledDate) {
      prescription.fulfilledDate = dto.fulfilledDate;
    }

    return this.prescriptionRepo.save(prescription);
  }

  async remove(id: number): Promise<void> {
    const result = await this.prescriptionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Prescription not found');
    }
  }
}
