import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { Users } from '../users/entities/user.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const { userId } = createMedicineDto;

    try {
      // Check if the user exists
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Set default values if not provided
      const medicineData = {
        ...createMedicineDto,
        expiryDate: new Date(createMedicineDto.expiryDate),
        category: createMedicineDto.category || 'General',
        dosageForm: createMedicineDto.dosageForm || 'Tablet',
        prescriptionRequired: createMedicineDto.prescriptionRequired || false,
        status: createMedicineDto.status || 'active',
        stockQuantity: createMedicineDto.stockQuantity || 0,
        minimumStockLevel: createMedicineDto.minimumStockLevel || 10,
      };

      // Create and save medicine
      const medicine = this.medicineRepository.create(medicineData);
      const savedMedicine = await this.medicineRepository.save(medicine);

      // Return medicine with user relation
      const result = await this.medicineRepository.findOne({
        where: { id: savedMedicine.id },
        relations: ['user'],
      });

      if (!result) {
        throw new NotFoundException(
          `Medicine with ID ${savedMedicine.id} not found after creation`,
        );
      }

      return result;
    } catch (error) {
      console.error('Error creating medicine:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle database errors
      if (error.code === '23505') {
        throw new ConflictException(
          'Medicine with these details already exists',
        );
      }

      throw new InternalServerErrorException(
        `Failed to create medicine: ${error.message}`,
      );
    }
  }

  // Fetch all medicines only user with pharmacy role and admin can access this

  async findAll(): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw new InternalServerErrorException('Failed to fetch medicines');
    }
  }

  // Get all medicines with pagination and search
  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Medicine[]; total: number }> {
    const query = this.medicineRepository
      .createQueryBuilder('medicine')
      .leftJoinAndSelect('medicine.user', 'user');

    if (search) {
      query.where(
        'medicine.name LIKE :search OR medicine.description LIKE :search OR medicine.manufacturer LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('medicine.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Medicine> {
    try {
      const medicine = await this.medicineRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!medicine) {
        throw new NotFoundException(`Medicine with ID ${id} not found`);
      }

      return medicine;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching medicine:', error);
      throw new InternalServerErrorException('Failed to fetch medicine');
    }
  }

  async findByUserId(userId: number, doctorId: number): Promise<Medicine[]> {
    try {
      // Example logic: Check if the user is assigned to the doctor
      // You should replace this with your actual assignment check logic
      const doctor = await this.usersRepository.findOne({
        where: { id: doctorId },
      });
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!doctor || !user) {
        throw new NotFoundException(
          `User with ID ${userId} or Doctor with ID ${doctorId} not found`,
        );
      }

      // Replace this with your actual assignment logic
      // For example, if you have an assignments table, query it here
      const isAssigned = true; // Set to true or false based on your logic

      if (!isAssigned) {
        throw new ForbiddenException(
          `User with ID ${userId} is not assigned to doctor with ID ${doctorId}`,
        );
      }

      return await this.medicineRepository.find({
        where: { userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.log('Error fetching medicines by user ID:', error);
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch medicines by user ID',
      );
    }
  }

  async findByCategory(category: string): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        where: { category },
        relations: ['user'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching medicines by category:', error);
      throw new InternalServerErrorException('Failed to fetch medicines');
    }
  }

  async findByManufacturer(manufacturer: string): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        where: { manufacturer },
        relations: ['user'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching medicines by manufacturer:', error);
      throw new InternalServerErrorException('Failed to fetch medicines');
    }
  }

  async findExpiringSoon(days: number = 30): Promise<Medicine[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await this.medicineRepository.find({
        where: {
          expiryDate: Between(new Date(), futureDate),
        },
        relations: ['user'],
        order: { expiryDate: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching expiring medicines:', error);
      throw new InternalServerErrorException(
        'Failed to fetch expiring medicines',
      );
    }
  }

  async findLowStock(): Promise<Medicine[]> {
    try {
      return await this.medicineRepository
        .createQueryBuilder('medicine')
        .leftJoinAndSelect('medicine.user', 'user')
        .where('medicine.stockQuantity <= medicine.minimumStockLevel')
        .orderBy('medicine.stockQuantity', 'ASC')
        .getMany();
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      throw new InternalServerErrorException(
        'Failed to fetch low stock medicines',
      );
    }
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    try {
      return await this.medicineRepository
        .createQueryBuilder('medicine')
        .leftJoinAndSelect('medicine.user', 'user')
        .where('medicine.name ILIKE :query', { query: `%${query}%` })
        .orWhere('medicine.manufacturer ILIKE :query', { query: `%${query}%` })
        .orWhere('medicine.category ILIKE :query', { query: `%${query}%` })
        .orWhere('medicine.description ILIKE :query', { query: `%${query}%` })
        .orderBy('medicine.name', 'ASC')
        .getMany();
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw new InternalServerErrorException('Failed to search medicines');
    }
  }

  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        where: {
          price: Between(minPrice, maxPrice),
        },
        relations: ['user'],
        order: { price: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching medicines by price range:', error);
      throw new InternalServerErrorException(
        'Failed to fetch medicines by price range',
      );
    }
  }

  async findPrescriptionMedicines(): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        where: { prescriptionRequired: true },
        relations: ['user'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching prescription medicines:', error);
      throw new InternalServerErrorException(
        'Failed to fetch prescription medicines',
      );
    }
  }

  async findOTCMedicines(): Promise<Medicine[]> {
    try {
      return await this.medicineRepository.find({
        where: { prescriptionRequired: false },
        relations: ['user'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching OTC medicines:', error);
      throw new InternalServerErrorException('Failed to fetch OTC medicines');
    }
  }

  async getMedicineStats(): Promise<any> {
    try {
      const totalMedicines = await this.medicineRepository.count();
      return { data: { total: totalMedicines } };
    } catch (error) {
      console.error('Error fetching medicine statistics:', error);
      throw new InternalServerErrorException(
        'Failed to fetch medicine statistics',
      );
    }
  }

  async update(
    id: number,
    updateMedicineDto: UpdateMedicineDto,
  ): Promise<Medicine> {
    try {
      // First check if medicine exists
      const medicine = await this.findOne(id);

      // Prepare update data
      const updateData = {
        ...updateMedicineDto,
        ...(updateMedicineDto.expiryDate && {
          expiryDate: new Date(updateMedicineDto.expiryDate),
        }),
      };

      // Update the medicine
      await this.medicineRepository.update(id, updateData);

      // Return updated medicine
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating medicine:', error);
      throw new InternalServerErrorException('Failed to update medicine');
    }
  }

  async updateStock(id: number, newQuantity: number): Promise<Medicine> {
    try {
      const medicine = await this.findOne(id);
      await this.medicineRepository.update(id, { stockQuantity: newQuantity });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating medicine stock:', error);
      throw new InternalServerErrorException('Failed to update medicine stock');
    }
  }

  async updateStatus(id: number, status: string): Promise<Medicine> {
    try {
      const medicine = await this.findOne(id);
      await this.medicineRepository.update(id, { status });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating medicine status:', error);
      throw new InternalServerErrorException(
        'Failed to update medicine status',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const medicine = await this.findOne(id);
      await this.medicineRepository.remove(medicine);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing medicine:', error);
      throw new InternalServerErrorException('Failed to remove medicine');
    }
  }
}
