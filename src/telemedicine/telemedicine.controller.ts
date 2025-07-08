import {
  Controller,
  Post,Body,
  Get,Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpStatus,UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TelemedicineService } from './telemedicine.service';
import { CreateTelemedicineDto } from './dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from './dto/update-telemedicine.dto';
import { TelemedicineAppointment } from './entities/telemedicine.entity';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('telemedicine')
@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Post()
  @Roles(Role.PATIENT, Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new telemedicine appointment' })
  @ApiResponse({ status: 201, description: 'Telemedicine appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or doctor not available' })
  @ApiResponse({ status: 404, description: 'Patient or doctor not found' })
  async createAppointment(
    @Body() createTelemedicineDto: CreateTelemedicineDto
  ): Promise<{ statusCode: number; message: string; data: TelemedicineAppointment }> {
    try {
      const appointment = await this.telemedicineService.createAppointment(createTelemedicineDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Telemedicine appointment created successfully',
        data: appointment
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all telemedicine appointments' })
  @ApiResponse({ status: 200, description: 'Telemedicine appointments retrieved successfully' })
  async findAllAppointments(): Promise<{ statusCode: number; message: string; data: any[] }> {
    try {
      const appointments = await this.telemedicineService.findAllAppointments();
      return {
        statusCode: HttpStatus.OK,
        message: 'Telemedicine appointments retrieved successfully',
        data: appointments
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get telemedicine appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findAppointmentById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const appointment = await this.telemedicineService.findAppointmentById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Telemedicine appointment found',
        data: appointment
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update a telemedicine appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or doctor not available' })
  async updateAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTelemedicineDto: UpdateTelemedicineDto
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const appointment = await this.telemedicineService.updateAppointment(id, updateTelemedicineDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Telemedicine appointment updated successfully',
        data: appointment
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a telemedicine appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async deleteAppointment(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ statusCode: number; message: string }> {
    try {
      await this.telemedicineService.deleteAppointment(id);
      return {
        statusCode: HttpStatus.OK,
        message: `Telemedicine appointment with ID ${id} deleted successfully`
      };
    } catch (error) {
      throw error;
    }
  }
}
