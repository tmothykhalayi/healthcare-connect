import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicalService } from './medical.service';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { UpdateMedicalDto } from './dto/update-medical.dto';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully' })
  async create(@Body() createMedicalDto: CreateMedicalDto) {
    try {
      const record = await this.medicalService.create(createMedicalDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Medical record created successfully',
        data: record
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical records' })
  @ApiResponse({ status: 200, description: 'Medical records retrieved successfully' })
  async findAll() {
    const records = await this.medicalService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records retrieved successfully',
      data: records
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get medical records statistics' })
  async getStats() {
    const stats = await this.medicalService.getRecordStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records statistics retrieved successfully',
      data: stats
    };
  }

  @Get('urgent')
  @ApiOperation({ summary: 'Get urgent and critical medical records' })
  async getUrgentRecords() {
    const records = await this.medicalService.findUrgentRecords();
    return {
      statusCode: HttpStatus.OK,
      message: 'Urgent medical records retrieved successfully',
      data: records
    };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent medical records' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 7)' })
  async getRecentRecords(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days) : 7;
    const records = await this.medicalService.findRecentRecords(dayCount);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records from last ${dayCount} days retrieved successfully`,
      data: records
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search medical records' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async search(@Query('q') query: string) {
    const records = await this.medicalService.search(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search results retrieved successfully',
      data: records
    };
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get medical records by patient ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const records = await this.medicalService.findByPatientId(patientId);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records for patient ${patientId} retrieved successfully`,
      data: records
    };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get medical records by doctor ID' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  async findByDoctorId(@Param('doctorId', ParseIntPipe) doctorId: number) {
    const records = await this.medicalService.findByDoctorId(doctorId);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records by doctor ${doctorId} retrieved successfully`,
      data: records
    };
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Get medical records by appointment ID' })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID' })
  async findByAppointmentId(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    const records = await this.medicalService.findByAppointmentId(appointmentId);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records for appointment ${appointmentId} retrieved successfully`,
      data: records
    };
  }

  @Get('type/:recordType')
  @ApiOperation({ summary: 'Get medical records by record type' })
  @ApiParam({ name: 'recordType', description: 'Record type' })
  async findByRecordType(@Param('recordType') recordType: string) {
    const records = await this.medicalService.findByRecordType(recordType);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records of type '${recordType}' retrieved successfully`,
      data: records
    };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get medical records by status' })
  @ApiParam({ name: 'status', description: 'Record status' })
  async findByStatus(@Param('status') status: string) {
    const records = await this.medicalService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records with status '${status}' retrieved successfully`,
      data: records
    };
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Get medical records by priority' })
  @ApiParam({ name: 'priority', description: 'Record priority' })
  async findByPriority(@Param('priority') priority: string) {
    const records = await this.medicalService.findByPriority(priority);
    return {
      statusCode: HttpStatus.OK,
      message: `Medical records with priority '${priority}' retrieved successfully`,
      data: records
    };
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get medical records by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const records = await this.medicalService.findByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records for date range retrieved successfully',
      data: records
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const record = await this.medicalService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical record found',
      data: record
    };
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async archiveRecord(@Param('id', ParseIntPipe) id: number) {
    const result = await this.medicalService.archiveRecord(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Bulk update medical record status' })
  async bulkUpdateStatus(@Body() body: { recordIds: number[], status: string }) {
    const result = await this.medicalService.bulkUpdateStatus(body.recordIds, body.status);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMedicalDto: UpdateMedicalDto) {
    const result = await this.medicalService.update(id, updateMedicalDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.medicalService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}