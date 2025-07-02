import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, Users } from './entities/user.entity';

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
  @ApiQuery({ name: 'role', enum: UserRole, required: false, description: 'Filter by user role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'User statistics retrieved successfully',
      data: stats
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully' })
  async getActiveUsers() {
    const users = await this.usersService.getActiveUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active users retrieved successfully',
      data: users
    };
  }

  @Get('verified')
  @ApiOperation({ summary: 'Get all verified users' })
  @ApiResponse({ status: 200, description: 'Verified users retrieved successfully' })
  async getVerifiedUsers() {
    const users = await this.usersService.getVerifiedUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Verified users retrieved successfully',
      data: users
    };
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: UserRole, description: 'User role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findByRole(@Param('role') role: UserRole) {
    const users = await this.usersService.findByRole(role);
    return {
      statusCode: HttpStatus.OK,
      message: `Users with role '${role}' retrieved successfully`,
      data: users
    };
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  async getDoctors() {
    const doctors = await this.usersService.getDoctors();
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctors retrieved successfully',
      data: doctors
    };
  }

  @Get('patients')
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  async getPatients() {
    const patients = await this.usersService.getPatients();
    return {
      statusCode: HttpStatus.OK,
      message: 'Patients retrieved successfully',
      data: patients
    };
  }

  @Get('admins')
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'Admins retrieved successfully' })
  async getAdmins() {
    const admins = await this.usersService.getAdmins();
    return {
      statusCode: HttpStatus.OK,
      message: 'Admins retrieved successfully',
      data: admins
    };
  }

  @Get('pharmacies')
  @ApiOperation({ summary: 'Get all pharmacies' })
  @ApiResponse({ status: 200, description: 'Pharmacies retrieved successfully' })
  async getPharmacies() {
    const pharmacies = await this.usersService.getPharmacies();
    return {
      statusCode: HttpStatus.OK,
      message: 'Pharmacies retrieved successfully',
      data: pharmacies
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query('q') query: string) {
    const users = await this.usersService.search(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search results retrieved successfully',
      data: users
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Patch(':id/last-login')
  @ApiOperation({ summary: 'Update user last login' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Last login updated successfully' })
  async updateLastLogin(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.updateLastLogin(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Bulk update user status' })
  @ApiResponse({ status: 200, description: 'Users updated successfully' })
  async bulkUpdateStatus(@Body() body: { userIds: number[], isActive: boolean }) {
    const result = await this.usersService.bulkUpdateStatus(body.userIds, body.isActive);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch('email/:email')
  @ApiOperation({ summary: 'Update user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateByEmail(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.updateByEmail(email, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete('email/:email')
  @ApiOperation({ summary: 'Delete user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeByEmail(@Param('email') email: string) {
    const result = await this.usersService.deleteByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}