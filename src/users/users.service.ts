import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  // Create a new user with hashed password
  async create(createUserDto: CreateUserDto): Promise<Omit<Users, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: createUserDto.isEmailVerified ?? false,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);
      const { password, ...userWithoutPassword } = savedUser;
      return userWithoutPassword as Omit<Users, 'password'>;
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Get all users, optionally filtered by role
  async findAll(role?: UserRole): Promise<Users[]> {
    const where = role ? { role } : {};
    return this.usersRepository.find({
      where,
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isEmailVerified',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  // Find one user by email
  async findOne(email: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isEmailVerified',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  // Find one user by ID
  async findOneById(id: number): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isEmailVerified',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Update a user by email
  async update(email: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    try {
      await this.usersRepository.save(user);
      return { message: `User with email ${email} updated successfully` };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // Delete a user by email
  async delete(email: string) {
    const result = await this.usersRepository.delete({ email });

    if (result.affected === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return { message: `User with email ${email} has been removed` };
  }

  // Delete a user by ID
  async deleteById(id: number) {
    const result = await this.usersRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User with ID ${id} has been removed` };
  }
}
