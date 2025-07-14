import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetCurrentUserId } from '../auth/decorators/get-current-user-id.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('availability')
//@ApiBearerAuth()
//@UseGuards(AtGuard, RolesGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test endpoint working' })
  async test() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability module is working',
      data: { test: true },
    };
  }

  @Get('allDoctors')
  @ApiOperation({ summary: 'Get all availability slots for all doctors' })
  @ApiResponse({ status: 200, description: 'All availability slots retrieved successfully' })
  async getAllAvailabilitySlots() {
    const availabilities = await this.availabilityService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'All availability slots retrieved successfully',
      data: availabilities,
    };
  }

  @Get('range')
  @ApiOperation({ summary: 'Get availability slots by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Availability slots retrieved successfully' })
  async getAvailableSlotsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const availabilities = await this.availabilityService.getAvailableSlotsByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slots retrieved successfully',
      data: availabilities,
    };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get available slots for a specific doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  async getAvailableSlotsForDoctor(@Param('doctorId', ParseIntPipe) doctorId: number) {
    const availabilities = await this.availabilityService.findAvailableSlotsForDoctor(doctorId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Available slots retrieved successfully',
      data: availabilities,
    };
  }

  @Post()
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Create a new availability slot' })
  @ApiResponse({ status: 201, description: 'Availability slot created successfully' })
  @ApiResponse({ status: 400, description: 'Time slot conflicts with existing availability' })
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @GetCurrentUserId() userId: number,
  ) {
    const availability = await this.availabilityService.create(createAvailabilityDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Availability slot created successfully',
      data: availability,
    };
  }

  @Get()
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get all availability slots for the current doctor' })
  @ApiResponse({ status: 200, description: 'Availability slots retrieved successfully' })
  async getDoctorAvailabilitySlots(@GetCurrentUserId() userId: number) {
    const availabilities = await this.availabilityService.findByDoctorId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slots retrieved successfully',
      data: availabilities,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability slot by ID' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({ status: 200, description: 'Availability slot retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Availability slot not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const availability = await this.availabilityService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slot retrieved successfully',
      data: availability,
    };
  }

  @Patch(':id')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Update availability slot' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({ status: 200, description: 'Availability slot updated successfully' })
  @ApiResponse({ status: 404, description: 'Availability slot not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    const availability = await this.availabilityService.update(id, updateAvailabilityDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slot updated successfully',
      data: availability,
    };
  }

  @Delete(':id')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({ status: 200, description: 'Availability slot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Availability slot not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.availabilityService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slot deleted successfully',
    };
  }



  @Patch(':id/book')
  @ApiOperation({ summary: 'Mark availability slot as booked' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({ status: 200, description: 'Availability slot marked as booked' })
  async markAsBooked(@Param('id', ParseIntPipe) id: number) {
    const availability = await this.availabilityService.markAsBooked(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slot marked as booked',
      data: availability,
    };
  }

  @Patch(':id/available')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Mark availability slot as available' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({ status: 200, description: 'Availability slot marked as available' })
  async markAsAvailable(@Param('id', ParseIntPipe) id: number) {
    const availability = await this.availabilityService.markAsAvailable(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability slot marked as available',
      data: availability,
    };
  }
} 