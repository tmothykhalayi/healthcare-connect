import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from './entities/pharmacy.entity';
import { Users, UserRole } from '../users/entities/user.entity';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}
  //create  a pharmacies
  async create(createPharmacyDto: CreatePharmacyDto) {
    const { userId } = createPharmacyDto;

    // Check if the user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    //  assign role based on pharmacy status
    let role: UserRole;
    if (user.role === UserRole.ADMIN) {
      role = UserRole.ADMIN;
    } else {
      role = UserRole.PHARMACIST;
    }

    try {
      // Update the user's role
      await this.usersRepository.update(userId, { role });

      const pharmacy = this.pharmacyRepository.create({
        ...createPharmacyDto,
      });
      return await this.pharmacyRepository.save(pharmacy);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Pharmacy with this details already exists`,
        );
      }

      throw new InternalServerErrorException(
        `Failed to create pharmacy: ${error.message}`,
      );
    }
  }

  async createFromUser(user: Users): Promise<Pharmacy> {
    const existingPharmacy = await this.pharmacyRepository.findOne({
      where: { userId: user.id },
    });

    if (existingPharmacy) {
      return existingPharmacy;
    }

    try {
      const pharmacyData = {
        userId: user.id,
        pharmacyName: `${user.firstName} ${user.lastName} Pharmacy`, // Required
        name: `${user.firstName} ${user.lastName} Pharmacy`, // Also required
        licenseNumber: `PTEMP_${user.id}_${Date.now().toString().slice(-6)}`,
        address: 'Pending update',
        phoneNumber: user.phoneNumber || '(Not set)',
        email: user.email || '',
        openingHours: '9:00 AM - 6:00 PM',
        services: ['Prescription filling', 'Over-the-counter medication'],
        status: 'pending_verification',
        deliveryAvailable: false,
        onlineOrderingAvailable: false,
        insurancePlansAccepted: [],
        notes: '',
      };

      const newPharmacy = this.pharmacyRepository.create(pharmacyData);
      const savedPharmacy = await this.pharmacyRepository.save(newPharmacy);

      return savedPharmacy;
    } catch (error) {
      console.error('Error creating pharmacy from user:', error);
      throw new InternalServerErrorException(
        `Failed to create pharmacy profile: ${error.message}`,
      );
    }
  }

  //get all
  async findAll() {
    return await this.pharmacyRepository.find();
  }
  //get all pharmacies with user details
  async findOne(id: number) {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }

    return pharmacy;
  }

  async update(id: number, updatePharmacyDto: UpdatePharmacyDto) {
    await this.pharmacyRepository.update(id, updatePharmacyDto);
    return this.findOne(id);
  }

  // Find pharmacy by user ID
  async findByUserId(userId: number) {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy for user ID ${userId} not found`);
    }

    return pharmacy;
  }

  // Search pharmacies by name
  async searchByName(name: string) {
    return await this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .where('pharmacy.pharmacyName ILIKE :name', { name: `%${name}%` })
      .leftJoinAndSelect('pharmacy.user', 'user')
      .getMany();
  }

  // Find pharmacies with delivery service
  async findWithDelivery(deliveryAvailable: boolean) {
    return await this.pharmacyRepository.find({
      where: { deliveryAvailable },
      relations: ['user'],
    });
  }

  // Find pharmacies by location (city)
  async findByLocation(city: string) {
    return await this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .where('pharmacy.address ILIKE :city', { city: `%${city}%` })
      .leftJoinAndSelect('pharmacy.user', 'user')
      .getMany();
  }

  // Update pharmacy status
  async updateStatus(id: number, status: string) {
    const pharmacy = await this.findOne(id);
    await this.pharmacyRepository.update(id, { status });
    return { ...pharmacy, status };
  }

  // Get pharmacy statistics
  async getStats(id: number) {
    const pharmacy = await this.findOne(id);

    // This is a basic implementation - you can expand based on your needs
    return {
      pharmacyId: id,
      pharmacyName: pharmacy.pharmacyName,
      status: pharmacy.status,
      deliveryAvailable: pharmacy.deliveryAvailable,
      onlineOrderingAvailable: pharmacy.onlineOrderingAvailable,
      services: pharmacy.services,
      totalOrders: 0, 
      totalCustomers: 0, 
      monthlyRevenue: 0, 
    };
  }

  async remove(id: number) {
    const pharmacy = await this.findOne(id);
    return this.pharmacyRepository.remove(pharmacy);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.pharmacyRepository.delete({ user: { id: userId } });
  }
}
