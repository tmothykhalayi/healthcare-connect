import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  // Create a new user with hashed password
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role,
      isEmailVerified: createUserDto.isEmailVerified ?? false,
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Find all users, optionally filtered by role
  async findAll(role?: UserRole) {
    if (role) {
      return await this.usersRepository.find({ where: { role } });
    }
    return await this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified'],
    });
  }

  // Find one user by email
  async findOne(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  // Update user by email
  async update(email: string, updateUserDto: UpdateUserDto) {
    const result = await this.usersRepository.update({ email }, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with email ${email}`);
    }
    return { message: `User with email ${email} updated successfully` };
  }

  // Update user role by email
  async updateRole(email: string, role: UserRole) {
    const result = await this.usersRepository.update({ email }, { role });
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with email ${email}`);
    }
    return { message: `User with email ${email} has been updated to role ${role}` };
  }

  // Update user by id
  async updateById(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.usersRepository.update({ id }, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return { message: `User with id ${id} has been updated` };
  }

  // Delete user by email
  async delete(email: string) {
    const result = await this.usersRepository.delete({ email });
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with email ${email}`);
    }
    return { message: `User with email ${email} has been removed` };
  }

  // Delete user by id
  async deleteById(id: string) {
    const result = await this.usersRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return { message: `User with id ${id} has been removed` };
  }
}
