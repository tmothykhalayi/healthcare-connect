import { CreatePharmacistDto } from './dto/create-pharmacist.dto';
import { UpdatePharmacistDto } from './dto/update-pharmacist.dto';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacist } from './entities/pharmacist.entity';
import { Users } from '../users/entities/user.entity';
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity';

@Injectable()
export class PharmacistService {
  constructor(
    @InjectRepository(Pharmacist)
    private pharmacistRepository: Repository<Pharmacist>,

    @InjectRepository(Users)
    private userRepository: Repository<Users>,

    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  // Create Pharmacist and link to user
  async createPharmacist(
    userId: number,
    licenseNumber: string,
    pharmacyId: number,
  ): Promise<Pharmacist> {
    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Create new pharmacist entity
    const pharmacist = this.pharmacistRepository.create({
      licenseNumber,
      user,
    });

    return this.pharmacistRepository.save(pharmacist);
  }

  // A automatic role assignment
  async createFromUser(user: Users, pharmacy: Pharmacy): Promise<Pharmacist> {
    // Check if pharmacist record already exists
    const existingPharmacist = await this.pharmacistRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingPharmacist) {
      return existingPharmacist;
    }

    try {
      // Create pharmacist with NO NULL values
      const pharmacistData = {
        user: user,
        pharmacy: pharmacy,
        licenseNumber: `PHARM_${user.id}_${Date.now().toString().slice(-6)}`,
      };

      const newPharmacist = this.pharmacistRepository.create(pharmacistData);
      const savedPharmacist =
        await this.pharmacistRepository.save(newPharmacist);

      return savedPharmacist;
    } catch (error) {
      console.error('Error creating pharmacist from user:', error);
      throw new InternalServerErrorException(
        `Failed to create pharmacist profile: ${error.message}`,
      );
    }
  }

  // Find pharmacist by ID
  async findOne(id: number): Promise<Pharmacist> {
    const pharmacist = await this.pharmacistRepository.findOne({
      where: { id },
      relations: ['user', 'pharmacy'],
    });
    if (!pharmacist) {
      throw new NotFoundException(`Pharmacist with id ${id} not found`);
    }
    return pharmacist;
  }

  // Find all pharmacists
  async findAll(): Promise<Pharmacist[]> {
    return this.pharmacistRepository.find({ relations: ['user', 'pharmacy'] });
  }

  // Find all pharmacists with pagination and search
  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Pharmacist[]; total: number }> {
    const query = this.pharmacistRepository
      .createQueryBuilder('pharmacist')
      .leftJoinAndSelect('pharmacist.user', 'user')
      .leftJoinAndSelect('pharmacist.pharmacy', 'pharmacy');

    if (search) {
      query.where(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR pharmacist.licenseNumber LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // Update pharmacist (example: license number)
  async update(
    id: number,
    updateData: Partial<Pharmacist>,
  ): Promise<Pharmacist> {
    const pharmacist = await this.findOne(id);
    Object.assign(pharmacist, updateData);
    return this.pharmacistRepository.save(pharmacist);
  }

  // Delete pharmacist
  async remove(id: number): Promise<void> {
    await this.pharmacistRepository.delete(id);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.pharmacistRepository.delete({ user: { id: userId } });
  }

  // Find pharmacist by userId
  async findByUserId(userId: number): Promise<Pharmacist | null> {
    return this.pharmacistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'pharmacy'],
    });
  }
}
