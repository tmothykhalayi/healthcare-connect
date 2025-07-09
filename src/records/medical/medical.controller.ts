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
import { MedicalService } from './medical.service';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { UpdateMedicalDto } from './dto/update-medical.dto';
//import { UserRole, Users } from '../../users/entities/user.entity';
//import { AtGuard, RolesGuard } from '../../auth/guards';
//import { Roles } from '../../auth/decorators/roles.decorator';
//import { Role } from '../../auth/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('medical-records')
@ApiBearerAuth()
//@UseGuards(AtGuard, RolesGuard)
@Controller('medical-records')
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  @Post()
 // @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
  })
  async create(@Body() createMedicalDto: CreateMedicalDto) {
    try {
      const record = await this.medicalService.create(createMedicalDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Medical record created successfully',
        data: record,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all medical records' })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async findAll() {
    const records = await this.medicalService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records retrieved successfully',
      data: records,
    };
  }

  @Get('stats')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get medical records statistics' })
  async getStats() {
    const stats = await this.medicalService.getRecordStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('urgent')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get urgent and critical medical records' })
  async getUrgentRecords() {
    const records = await this.medicalService.findUrgentRecords();
    return {
      statusCode: HttpStatus.OK,
      message: 'Urgent medical records retrieved successfully',
      data: records,
    };
  }

  @Get('recent')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get recent medical records' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days (default: 7)',
  })
  async getRecentRecords(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days) : 7;
    const records = await this.medicalService.findRecentRecords(dayCount);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records from last ${dayCount} days retrieved successfully`,
      data: records,
    };
  }

  @Get('search')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Search medical records' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async search(@Query('q') query: string) {
    const records = await this.medicalService.search(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search results retrieved successfully',
      data: records,
    };
  }

  @Get('patient/:patientId')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get medical records by patient ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const records = await this.medicalService.findByPatientId(patientId);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records for patient ${patientId} retrieved successfully`,
      data: records,
    };
  }

  @Get('appointment/:appointmentId')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get medical records by appointment ID' })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID' })
  async findByAppointmentId(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ) {
    const records =
      await this.medicalService.findByAppointmentId(appointmentId);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records for appointment ${appointmentId} retrieved successfully`,
      data: records,
    };
  }

  @Get(':id')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const record = await this.medicalService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical record found',
      data: record,
    };
  }

  @Patch(':id/archive')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Archive medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async archiveRecord(@Param('id', ParseIntPipe) id: number) {
    const result = await this.medicalService.archiveRecord(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Patch(':id')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicalDto: UpdateMedicalDto,
  ) {
    const result = await this.medicalService.update(id, updateMedicalDto);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Delete(':id')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Delete medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.medicalService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
