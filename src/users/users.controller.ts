import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, UseGuards ,ParseIntPipe  ,Req} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, Users } from './entities/user.entity';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';


@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
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

  // Get all users
  @Get()
@Roles(Role.ADMIN)
@ApiOperation({ summary: 'Get all users' })
@ApiResponse({ status: 200, description: 'Users retrieved successfully' })
async findAll(
  @Req() req: Request & { user: { id: number; role: Role } }
) {
  const userRole = req.user.role;
  const userId = req.user.id;

  let users;
  if (userRole === Role.ADMIN) {
    users = await this.usersService.findAll();
  } else {
    users = await this.usersService.findOne(userId);
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Users retrieved successfully',
    data: users,
  };
}

  // Get user statistics
  @Get('stats')
  @Roles(Role.ADMIN)
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




  @Get(':id')
  @Roles(Role.ADMIN)
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

  @Patch('email/:email')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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


  @Delete(':id')
  @Roles(Role.ADMIN)
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