import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async create(@Body() createAdminDto: CreateAdminDto) {
    
    try {
      const admin = await this.adminService.create(createAdminDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Admin created successfully',
        data: admin
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'Admins retrieved successfully' })
  async findAll() {
    const admins = await this.adminService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Admins retrieved successfully',
      data: admins
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin statistics' })
  async getStats() {
    const stats = await this.adminService.getAdminStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin statistics retrieved successfully',
      data: stats
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active admins' })
  async getActiveAdmins() {
    const admins = await this.adminService.getActiveAdmins();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active admins retrieved successfully',
      data: admins
    };
  }

  @Get('super-admins')
  @ApiOperation({ summary: 'Get all super admins' })
  async getSuperAdmins() {
    const admins = await this.adminService.getSuperAdmins();
    return {
      statusCode: HttpStatus.OK,
      message: 'Super admins retrieved successfully',
      data: admins
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search admins by name, email, or department' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async search(@Query('q') query: string) {
    const admins = await this.adminService.search(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search results retrieved successfully',
      data: admins
    };
  }

  @Get('level/:adminLevel')
  @ApiOperation({ summary: 'Get admins by admin level' })
  @ApiParam({ name: 'adminLevel', description: 'Admin level (super_admin, admin, moderator)' })
  async findByAdminLevel(@Param('adminLevel') adminLevel: string) {
    const admins = await this.adminService.findByAdminLevel(adminLevel);
    return {
      statusCode: HttpStatus.OK,
      message: `Admins with level '${adminLevel}' retrieved successfully`,
      data: admins
    };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get admins by status' })
  @ApiParam({ name: 'status', description: 'Admin status (active, inactive, suspended)' })
  async findByStatus(@Param('status') status: string) {
    const admins = await this.adminService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Admins with status '${status}' retrieved successfully`,
      data: admins
    };
  }

  @Get('department/:department')
  @ApiOperation({ summary: 'Get admins by department' })
  @ApiParam({ name: 'department', description: 'Department name' })
  async findByDepartment(@Param('department') department: string) {
    const admins = await this.adminService.findByDepartment(department);
    return {
      statusCode: HttpStatus.OK,
      message: `Admins in department '${department}' retrieved successfully`,
      data: admins
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get admin by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const admin = await this.adminService.findByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin found',
      data: admin
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const admin = await this.adminService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Admin found',
      data: admin
    };
  }

  @Patch(':id/last-login')
  @ApiOperation({ summary: 'Update admin last login timestamp' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  async updateLastLogin(@Param('id', ParseIntPipe) id: number) {
    const result = await this.adminService.updateLastLogin(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Bulk update admin status' })
  async bulkUpdateStatus(@Body() body: { adminIds: number[], status: string }) {
    const result = await this.adminService.bulkUpdateStatus(body.adminIds, body.status);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateAdminDto: UpdateAdminDto) {
    const result = await this.adminService.update(id, updateAdminDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.adminService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}