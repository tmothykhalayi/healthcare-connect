import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, Users } from './entities/user.entity';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

//@UseGuards(AtGuard, RolesGuard)
//@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @Roles(Role.ADMIN ,Role.PATIENT, Role.DOCTOR, Role.PHARMACY)
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
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  @Get()
  // @Roles(Role.ADMIN) // <--- Commented out to remove admin-only restriction
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Get all patients
  @Get('patients')
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  async getPatients() {
    try {
      const patients = await this.usersService.getPatients();
      return {
        statusCode: HttpStatus.OK,
        message: 'Patients retrieved successfully',
        data: patients,
      };
    } catch (error) {
      console.error('Error in getPatients:', error);
      throw error;
    }
  }

  // Get current user profile
  @Get('profile')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getCurrentUserProfile(
    @GetCurrentUser() user: { id: number; role: Role },
  ) {
    try {
      const userId = user.id;
      // Fetch user with all possible role relations
      const userProfile = await this.usersService.findOne(userId);

      // Attach the correct profile based on role
      let profile: any = null;
      if (userProfile.role === 'patient' && userProfile.patient)
        profile = { ...userProfile.patient, id: userProfile.patient.id };
      if (userProfile.role === 'doctor' && userProfile.doctor)
        profile = { ...userProfile.doctor, id: userProfile.doctor.id };
      if (userProfile.role === 'pharmacist' && userProfile.pharmacist)
        profile = { ...userProfile.pharmacist, id: userProfile.pharmacist.id };

      // Remove the patient/doctor/pharmacist properties to avoid duplication
      const { patient, doctor, pharmacist, ...userData } = userProfile;

      return {
        message: 'User profile retrieved successfully',
        data: {
          ...userData,
          profile,
        },
      };
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      throw error;
    }
  }

  // Get user statistics
  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user,
    };
  }

  @Patch('email/:email')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateByEmail(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.usersService.updateByEmail(email, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Patch(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.usersService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Delete(':id')
  // @Roles(Role.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete user and all related data' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User and related data deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forceRemove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.forceRemove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
