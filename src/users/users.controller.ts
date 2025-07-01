import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {UserRole ,Users} from './entities/user.entity'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(@InjectRepository(Users) private usersRepository: Repository<Users>) {}

  //create a new user
  @Post()
  async create (createUserDto: CreateUserDto) {
    return await this.usersRepository
      .save(createUserDto)
      .then((user) => {
        return `User with email ${user.email} has been created`;
      })
      .catch((error) => {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
      });

  }
  //find all users
  @Get()
  async findAll(role?: UserRole) {
    if (role) {
      return await this.usersRepository.find({
        where: { role: role },
      });
    }
    return await this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified'],
    });
  }

  //find one user by email
  @Get(':email')
  async findOne(@Param('email') email: string) {
    return await this.usersRepository
      .findOne({
        where: { email },
      })
      .then((user) => {
        if (!user) {
          return `No user found with email ${email}`;
        }
        return user;
      })
      .catch((error) => {
        console.error('Error finding user:', error);
        throw new Error(`Failed to find user with email ${email}`);
      });
  }

  //update user by email
  @Patch(':email')
  async update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersRepository
      .update({ email }, updateUserDto)
      .then(() => {
        return `User with email ${email} has been updated`;
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user with email ${email}`);
      });
  }

  //update a user's role
  @Patch(':email/role')
  async updateRole(@Param('email') email: string, @Body('role') role: UserRole) {
    return await this.usersRepository
      .update({ email }, { role })
      .then((result) => {
        if (result.affected === 0) {
          return `No user found with email ${email}`;
        }
        return `User with email ${email} has been updated to role ${role}`;
      })
      .catch((error) => {
        console.error('Error updating user role:', error);
        throw new Error(`Failed to update user role for email ${email}`);
      });
  }

  //update user by id
  @Patch(':id')
  async updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersRepository
      .update(id, updateUserDto)
      .then((result) => {
        if (result.affected === 0) {
          return `No user found with id ${id}`;
        }
        return `User with id ${id} has been updated`;
      })
      .catch((error) => {
        console.error('Error updating user by id:', error);
        throw new Error(`Failed to update user with id ${id}`);
      });
  }
  

  //delete a user  by email
  @Delete(':email')
  async delete(@Param('email') email: string) {
    return await this.usersRepository
      .delete({ email })
      .then((result) => {
        if (result.affected === 0) {
          return `No user found with email ${email}`;
        }
        return `User with email ${email} has been removed`;
      })
      .catch((error) => {
        console.error('Error removing user:', error);
        throw new Error(`Failed to remove user with email ${email}`);
      });
  }

  //delete a user by id 
  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return await this.usersRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return `No user found with id ${id}`;
        }
        return `User with id ${id} has been removed`;
      })
      .catch((error) => {
        console.error('Error removing user by id:', error);
        throw new Error(`Failed to remove user with id ${id}`);
      });
  }






}