import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { Users, UserRole } from '../users/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Check if admin already exists for this user
    const existingAdmin = await this.adminRepository.findOne({
      where: { userId: createAdminDto.userId },
    });

    if (existingAdmin) {
      throw new ConflictException(
        `Admin already exists for user ID ${createAdminDto.userId}`,
      );
    }

    //  permissions
    let permissions: string[] = [];
    if (createAdminDto.permissions) {
      permissions = Array.isArray(createAdminDto.permissions)
        ? createAdminDto.permissions
        : Object.keys(createAdminDto.permissions);
    }

    const newAdmin = this.adminRepository.create({
      ...createAdminDto,
      userId: createAdminDto.userId,
      permissions: permissions,
    });

    try {
      const savedAdmin = await this.adminRepository.save(newAdmin);
      return Array.isArray(savedAdmin) ? savedAdmin[0] : savedAdmin;
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to create admin');
    }
  }

  // method for role assignment
  async createFromUser(user: Users): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    // Create basic admin record with NO NULL values
    try {
      const adminData = {
        user: user,
        adminLevel: 'admin',
        department: 'General',
        phoneNumber: user.phoneNumber || '(Not set)',
        status: 'active',
        permissions: {
          users: ['read'],
          appointments: ['read'],
          medical_records: ['read'],
        },
      };

      const newAdmin = this.adminRepository.create(adminData);
      return await this.adminRepository.save(newAdmin);
    } catch (error) {
      console.error('Error creating admin from user:', error);
      throw new InternalServerErrorException(
        `Failed to create admin profile: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Admin[]> {
    try {
      return await this.adminRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve admins');
    }
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async findByUserId(userId: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with user ID ${userId} not found`);
    }

    return admin;
  }

  // Find admins by admin level
  async findByAdminLevel(adminLevel: string): Promise<Admin[]> {
    return await this.adminRepository.find({
      where: { adminLevel } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Find admins by status
  async findByStatus(status: string): Promise<Admin[]> {
    return await this.adminRepository.find({
      where: { status } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Find admins by department
  async findByDepartment(department: string): Promise<Admin[]> {
    return await this.adminRepository.find({
      where: { department: Like(`%${department}%`) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string): Promise<Admin[]> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .where('user.firstName LIKE :query', { query: `%${query}%` })
      .orWhere('user.lastName LIKE :query', { query: `%${query}%` })
      .orWhere('user.email LIKE :query', { query: `%${query}%` })
      .orWhere('admin.department LIKE :query', { query: `%${query}%` })
      .orderBy('admin.createdAt', 'DESC')
      .getMany();
  }

  async getActiveAdmins(): Promise<Admin[]> {
    return await this.adminRepository.find({
      where: { status: 'active' } as any,
      relations: ['user'],
      order: { lastLogin: 'DESC' },
    });
  }

  async getSuperAdmins(): Promise<Admin[]> {
    return await this.adminRepository.find({
      where: { adminLevel: 'super_admin' } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
  //  async getAdminsByDepartment(department: string)
  async getAdminStats(): Promise<any> {
    const totalAdmins = await this.adminRepository.count();
    const activeAdmins = await this.adminRepository.count({
      where: { status: 'active' } as any,
    });
    const inactiveAdmins = await this.adminRepository.count({
      where: { status: 'inactive' } as any,
    });
    const suspendedAdmins = await this.adminRepository.count({
      where: { status: 'suspended' } as any,
    });

    const superAdmins = await this.adminRepository.count({
      where: { adminLevel: 'super_admin' } as any,
    });
    const regularAdmins = await this.adminRepository.count({
      where: { adminLevel: 'admin' } as any,
    });
    const moderators = await this.adminRepository.count({
      where: { adminLevel: 'moderator' } as any,
    });

    return {
      total: totalAdmins,
      byStatus: {
        active: activeAdmins,
        inactive: inactiveAdmins,
        suspended: suspendedAdmins,
      },
      byLevel: {
        super_admin: superAdmins,
        admin: regularAdmins,
        moderator: moderators,
      },
    };
  }

  // Update last login timestamp for an admin
  async updateLastLogin(id: number): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    admin.lastLogin = new Date();

    try {
      await this.adminRepository.save(admin);
      return { message: `Admin last login updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update last login');
    }
  }

  // Update admin details
  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    const updateData = {
      ...updateAdminDto,
      ...(updateAdminDto.lastLogin && {
        lastLogin: new Date(updateAdminDto.lastLogin),
      }),
    };

    Object.assign(admin, updateData);

    try {
      await this.adminRepository.save(admin);
      return { message: `Admin with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update admin');
    }
  }

  // Remove an admin by ID
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.adminRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return { message: `Admin with ID ${id} deleted successfully` };
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.adminRepository.delete({ user: { id: userId } });
  }
}
