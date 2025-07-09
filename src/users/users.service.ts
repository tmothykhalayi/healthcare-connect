import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminService } from '../admin/admin.service';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { PharmacyService } from '../pharmacy/pharmacy.service';
import { PharmacistService } from '../pharmacist/pharmacist.service';
import { Pharmacist } from '../pharmacist/entities/pharmacist.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private adminService: AdminService,
    private doctorsService: DoctorsService,
    private patientsService: PatientsService,
    private pharmacyService: PharmacyService,
    private pharmacistService: PharmacistService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    try {
      // Hash the password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const userData = {
        ...createUserDto,
        password: hashedPassword, // Use hashed password
        role: createUserDto.role || UserRole.PATIENT,
        isEmailVerified: createUserDto.isEmailVerified || false,
        isActive:
          createUserDto.isActive !== undefined ? createUserDto.isActive : true,
      };

      // Validate role
      if (!Object.values(UserRole).includes(userData.role)) {
        throw new BadRequestException(`Invalid role: ${userData.role}`);
      }

      // Create the user first
      const newUser = this.usersRepository.create(userData);
      const savedUser = await this.usersRepository.save(newUser);

      // Now create the role-specific record
      console.log(
        `Creating ${savedUser.role} profile for user ID ${savedUser.id}`,
      );

      try {
        await this.assignToRoleTable(savedUser);
        console.log(
          `Successfully created ${savedUser.role} profile for user ID ${savedUser.id}`,
        );
      } catch (error) {
        console.error(`Error creating ${savedUser.role} profile:`, error);
        // If role assignment fails, delete the user and re-throw the error
        await this.usersRepository.remove(savedUser);
        throw new InternalServerErrorException(
          `Failed to create ${savedUser.role} profile: ${error.message}`,
        );
      }

      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Find all users with optional role filter
  async findAll(): Promise<Users[]> {
    try {
      // First try with basic query without relations
      return await this.usersRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
  // Find user by ID with relations

  async findOne(id: number): Promise<Users> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['patient', 'doctor', 'admin', 'pharmacy'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findByRole(role: UserRole): Promise<Users[]> {
    return await this.usersRepository.find({
      where: { role },
      relations: ['patient', 'doctor', 'admin', 'pharmacy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDoctors(): Promise<Users[]> {
    return await this.findByRole(UserRole.DOCTOR);
  }

  async getPatients(): Promise<Users[]> {
    return await this.findByRole(UserRole.PATIENT);
  }

  async getAdmins(): Promise<Users[]> {
    return await this.findByRole(UserRole.ADMIN);
  }

  async getPharmacies(): Promise<Users[]> {
    return await this.findByRole(UserRole.PHARMACIST);
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { isActive: true },
    });
    const verifiedUsers = await this.usersRepository.count({
      where: { isEmailVerified: true },
    });

    const doctors = await this.usersRepository.count({
      where: { role: UserRole.DOCTOR },
    });
    const patients = await this.usersRepository.count({
      where: { role: UserRole.PATIENT },
    });
    const admins = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const pharmacies = await this.usersRepository.count({
      where: { role: UserRole.PHARMACIST },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      byRole: {
        doctors,
        patients,
        admins,
        pharmacies,
      },
    };
  }

  // Update by ID
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);

    try {
      await this.usersRepository.save(user);
      return { message: `User with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // Update by email
  async updateByEmail(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);

    try {
      await this.usersRepository.save(user);
      return { message: `User with email ${email} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // Delete by ID
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.usersRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User with ID ${id} deleted successfully` };
  }

  // Delete by email
  async deleteByEmail(email: string): Promise<{ message: string }> {
    const result = await this.usersRepository.delete({ email });

    if (result.affected === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return { message: `User with email ${email} deleted successfully` };
  }

  async search(query: string): Promise<Users[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patient', 'patient')
      .leftJoinAndSelect('user.doctor', 'doctor')
      .leftJoinAndSelect('user.admin', 'admin')
      .leftJoinAndSelect('user.pharmacy', 'pharmacy')
      .where('user.firstName LIKE :query', { query: `%${query}%` })
      .orWhere('user.lastName LIKE :query', { query: `%${query}%` })
      .orWhere('user.email LIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async createUserWithRole(createUserDto: CreateUserDto): Promise<Users> {
    // Create the base user
    const user = await this.create(createUserDto);

    // Automatically assign to appropriate role table
    await this.assignToRoleTable(user);

    return user;
  }

  async assignUserRole(userId: number, role: UserRole): Promise<void> {
    // Update user role
    await this.usersRepository.update(userId, { role });

    // Get the updated user
    const user = await this.findOne(userId);

    // Assign to appropriate role table
    await this.assignToRoleTable(user);
  }

  private async assignToRoleTable(user: Users): Promise<void> {
    console.log(
      `Starting role assignment for user ${user.id} with role ${user.role}`,
    );

    try {
      switch (user.role) {
        case UserRole.ADMIN:
          console.log(`Creating admin profile for user ${user.id}`);
          await this.adminService.createFromUser(user);
          break;

        case UserRole.DOCTOR:
          console.log(`Creating doctor profile for user ${user.id}`);
          await this.doctorsService.createFromUser(user);
          break;

        case UserRole.PATIENT:
          console.log(`Creating patient profile for user ${user.id}`);
          await this.patientsService.createFromUser(user);
          break;

        case UserRole.PHARMACIST:
          console.log(`Creating pharmacy and pharmacist profiles for user ${user.id}`);
          // First create the pharmacy
          const pharmacy = await this.pharmacyService.createFromUser(user);
          // Then create the pharmacist and link to the pharmacy
          await this.pharmacistService.createFromUser(user, pharmacy);
          break;

        default:
          throw new BadRequestException(`Invalid role: ${user.role}`);
      }

      console.log(`Successfully completed role assignment for user ${user.id}`);
    } catch (error) {
      console.error(`Error in assignToRoleTable for user ${user.id}:`, error);
      throw error; // Re-throw to be handled by caller
    }
  }
}
