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
  @ApiOperation({ summary: 'Get all medical records (paginated & searchable)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async findAllPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let data: any[] = [];
    let total = 0;
    if (search) {
      const result = await this.medicalService.searchPaginated(
        search,
        skip,
        limitNum,
      );
      data = result[0];
      total = result[1];
    } else {
      const result = await this.medicalService.findAllPaginated(skip, limitNum);
      data = result[0];
      total = result[1];
    }
    // Ensure patientId and doctorId are present in each record
    const mappedData = data.map((record) => ({
      ...record,
      patientId: record.patientId ?? record.patient?.id ?? null,
      doctorId: record.doctorId ?? record.doctor?.id ?? null,
      createdAt: record.createdAt
        ? new Date(record.createdAt).toISOString()
        : null,
      updatedAt: record.updatedAt
        ? new Date(record.updatedAt).toISOString()
        : null,
      nextAppointmentDate: record.nextAppointmentDate
        ? new Date(record.nextAppointmentDate).toISOString()
        : null,
    }));
    return {
      statusCode: HttpStatus.OK,
      message: 'Medical records retrieved successfully',
      data: mappedData,
      total,
      page: pageNum,
      limit: limitNum,
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

  @Get('prescriptions/pharmacy/:pharmacyId')
  @ApiOperation({ summary: 'Get prescription records by pharmacy ID' })
  @ApiParam({ name: 'pharmacyId', description: 'Pharmacy ID' })
  async findPrescriptionsByPharmacyId(
    @Param('pharmacyId', ParseIntPipe) pharmacyId: number,
  ) {
    const records =
      await this.medicalService.findPrescriptionsByPharmacyId(pharmacyId);
    return {
      statusCode: HttpStatus.OK,
      message: `Prescription records for pharmacy ${pharmacyId} retrieved successfully`,
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
