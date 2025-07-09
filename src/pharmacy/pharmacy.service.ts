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

    // Automatically assign role based on pharmacy status
    let role: UserRole;
    if (user.role === UserRole.ADMIN) {
      role = UserRole.ADMIN;
    } else {
      role = UserRole.PHARMACY;
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
    // Check if pharmacy record already exists
    const existingPharmacy = await this.pharmacyRepository.findOne({
      where: { userId: user.id },
    });

    if (existingPharmacy) {
      return existingPharmacy;
    }

    try {
      // Create pharmacy with NO NULL values
      const pharmacyData = {
        userId: user.id,
        pharmacyName: `${user.firstName} ${user.lastName} Pharmacy`,
        licenseNumber: `PTEMP_${user.id}_${Date.now().toString().slice(-6)}`,
        address: 'Pending update',
        phoneNumber: user.phoneNumber || '(Not set)',
        email: user.email,
        openingHours: '9:00 AM - 6:00 PM',
        services: ['Prescription filling', 'Over-the-counter medication'],
        status: 'pending_verification',
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
      // Add more statistics as needed
      totalOrders: 0, // Placeholder - implement when you have orders
      totalCustomers: 0, // Placeholder - implement when you have customers
      monthlyRevenue: 0, // Placeholder - implement when you have revenue tracking
    };
  }

  async remove(id: number) {
    const pharmacy = await this.findOne(id);
    return this.pharmacyRepository.remove(pharmacy);
  }
}
