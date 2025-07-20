import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Medical } from './entities/medical.entity';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { UpdateMedicalDto } from './dto/update-medical.dto';

@Injectable()
export class MedicalService {
  // Paginated fetch
  async findAllPaginated(skip: number, take: number): Promise<[Medical[], number]> {
    try {
      const [data, total] = await this.medicalRepository.findAndCount({
        relations: ['patient', 'doctor', 'appointment'],
        order: { createdAt: 'DESC' },
        skip,
        take,
      });
      return [data, total];
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve medical records');
    }
  }

  // Paginated search
  async searchPaginated(query: string, skip: number, take: number): Promise<[Medical[], number]> {
    try {
      const qb = this.medicalRepository
        .createQueryBuilder('medical')
        .leftJoinAndSelect('medical.patient', 'patient')
        .leftJoinAndSelect('medical.doctor', 'doctor')
        .leftJoinAndSelect('medical.appointment', 'appointment')
        .leftJoinAndSelect('patient.user', 'patientUser')
        .leftJoinAndSelect('doctor.user', 'doctorUser')
        .where('medical.title LIKE :query', { query: `%${query}%` })
        .orWhere('medical.description LIKE :query', { query: `%${query}%` })
        .orWhere('medical.diagnosis LIKE :query', { query: `%${query}%` })
        .orWhere('patientUser.firstName LIKE :query', { query: `%${query}%` })
        .orWhere('patientUser.lastName LIKE :query', { query: `%${query}%` })
        .orWhere('doctorUser.firstName LIKE :query', { query: `%${query}%` })
        .orWhere('doctorUser.lastName LIKE :query', { query: `%${query}%` })
        .orderBy('medical.createdAt', 'DESC')
        .skip(skip)
        .take(take);
      const [data, total] = await qb.getManyAndCount();
      return [data, total];
    } catch (error) {
      throw new InternalServerErrorException('Failed to search medical records');
    }
  }
  constructor(
    @InjectRepository(Medical)
    private medicalRepository: Repository<Medical>,
  ) {}

  async create(createMedicalDto: CreateMedicalDto): Promise<Medical> {
    try {
      const medicalData = {
        ...createMedicalDto,
        ...(createMedicalDto.nextAppointmentDate && {
          nextAppointmentDate: new Date(createMedicalDto.nextAppointmentDate),
        }),
        priority: createMedicalDto.priority || 'normal',
        status: createMedicalDto.status || 'active',
      };

      const newRecord = this.medicalRepository.create(medicalData);
      const savedRecord = await this.medicalRepository.save(newRecord);

      const record = await this.medicalRepository.findOne({
        where: { id: savedRecord.id },
        relations: ['patient', 'doctor', 'appointment'],
      });

      if (!record) {
        throw new NotFoundException(
          `Medical record with ID ${savedRecord.id} not found after creation`,
        );
      }

      return record;
    } catch (error) {
      console.error('Error creating medical record:', error);

      if (error.code === '23503') {
        throw new BadRequestException(
          'Foreign key constraint violation: Patient, Doctor, or Appointment ID does not exist',
        );
      }

      throw new InternalServerErrorException(
        `Failed to create medical record: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Medical[]> {
    try {
      return await this.medicalRepository.find({
        relations: ['patient', 'doctor', 'appointment'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve medical records',
      );
    }
  }

  async findOne(id: number): Promise<Medical> {
    const record = await this.medicalRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment'],
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    return record;
  }

  async findByPatientId(patientId: number): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDoctorId(doctorId: number): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAppointmentId(appointmentId: number): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { appointmentId },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPrescriptionsByPharmacyId(pharmacyId: number): Promise<Medical[]> {
    // For now, return prescription records (recordType = 'prescription')
    // In a real implementation, you would filter by pharmacy association
    return await this.medicalRepository.find({
      where: { recordType: 'prescription' },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRecordType(recordType: string): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { recordType },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { status },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPriority(priority: string): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: { priority },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: {
        createdAt: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUrgentRecords(): Promise<Medical[]> {
    return await this.medicalRepository.find({
      where: [{ priority: 'urgent' }, { priority: 'critical' }],
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findRecentRecords(days: number = 7): Promise<Medical[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.medicalRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string): Promise<Medical[]> {
    return await this.medicalRepository
      .createQueryBuilder('medical')
      .leftJoinAndSelect('medical.patient', 'patient')
      .leftJoinAndSelect('medical.doctor', 'doctor')
      .leftJoinAndSelect('medical.appointment', 'appointment')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .where('medical.title LIKE :query', { query: `%${query}%` })
      .orWhere('medical.description LIKE :query', { query: `%${query}%` })
      .orWhere('medical.diagnosis LIKE :query', { query: `%${query}%` })
      .orWhere('patientUser.firstName LIKE :query', { query: `%${query}%` })
      .orWhere('patientUser.lastName LIKE :query', { query: `%${query}%` })
      .orWhere('doctorUser.firstName LIKE :query', { query: `%${query}%` })
      .orWhere('doctorUser.lastName LIKE :query', { query: `%${query}%` })
      .orderBy('medical.createdAt', 'DESC')
      .getMany();
  }

  async getRecordStats(): Promise<any> {
    const totalRecords = await this.medicalRepository.count();
    const activeRecords = await this.medicalRepository.count({
      where: { status: 'active' },
    });
    const archivedRecords = await this.medicalRepository.count({
      where: { status: 'archived' },
    });

    const urgentRecords = await this.medicalRepository.count({
      where: { priority: 'urgent' },
    });
    const criticalRecords = await this.medicalRepository.count({
      where: { priority: 'critical' },
    });

    const recordsByType = await this.medicalRepository
      .createQueryBuilder('medical')
      .select('medical.recordType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('medical.recordType')
      .getRawMany();

    return {
      total: totalRecords,
      byStatus: {
        active: activeRecords,
        archived: archivedRecords,
      },
      byPriority: {
        urgent: urgentRecords,
        critical: criticalRecords,
      },
      byType: recordsByType,
    };
  }

  async update(
    id: number,
    updateMedicalDto: UpdateMedicalDto,
  ): Promise<{ message: string }> {
    const record = await this.medicalRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    const updateData = {
      ...updateMedicalDto,
      ...(updateMedicalDto.nextAppointmentDate && {
        nextAppointmentDate: new Date(updateMedicalDto.nextAppointmentDate),
      }),
    };

    Object.assign(record, updateData);

    try {
      await this.medicalRepository.save(record);
      return { message: `Medical record with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update medical record');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.medicalRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    return { message: `Medical record with ID ${id} deleted successfully` };
  }

  async archiveRecord(id: number): Promise<{ message: string }> {
    const record = await this.medicalRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    record.status = 'archived';

    try {
      await this.medicalRepository.save(record);
      return { message: `Medical record with ID ${id} archived successfully` };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to archive medical record',
      );
    }
  }

  async bulkUpdateStatus(
    recordIds: number[],
    status: string,
  ): Promise<{ message: string }> {
    try {
      await this.medicalRepository
        .createQueryBuilder()
        .update(Medical)
        .set({ status })
        .where('id IN (:...recordIds)', { recordIds })
        .execute();

      return {
        message: `${recordIds.length} medical records updated successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to bulk update medical records',
      );
    }
  }
}
