import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users
    };
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('email') email: string) {
    const user = await this.usersService.findOne(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Patch(':email')
  @ApiOperation({ summary: 'Update user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(email, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Delete user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('email') email: string) {
    const result = await this.usersService.delete(email);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}