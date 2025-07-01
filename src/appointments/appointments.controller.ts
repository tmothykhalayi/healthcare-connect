import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      const appointment = await this.appointmentsService.create(createAppointmentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Appointment created successfully',
        data: appointment
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findAll() {
    const appointments = await this.appointmentsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointments retrieved successfully',
      data: appointments
    };
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s appointments' })
  async findToday() {
    const appointments = await this.appointmentsService.findToday();
    return {
      statusCode: HttpStatus.OK,
      message: 'Today\'s appointments retrieved successfully',
      data: appointments
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments (next 7 days)' })
  async findUpcoming() {
    const appointments = await this.appointmentsService.findUpcoming();
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming appointments retrieved successfully',
      data: appointments
    };
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get appointments by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  async findByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const appointments = await this.appointmentsService.findByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointments retrieved successfully',
      data: appointments
    };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get appointments by status' })
  @ApiParam({ name: 'status', description: 'Appointment status' })
  async findByStatus(@Param('status') status: string) {
    const appointments = await this.appointmentsService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Appointments with status '${status}' retrieved successfully`,
      data: appointments
    };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get appointments by doctor ID' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  async findByDoctorId(@Param('doctorId', ParseIntPipe) doctorId: number) {
    const appointments = await this.appointmentsService.findByDoctorId(doctorId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctor appointments retrieved successfully',
      data: appointments
    };
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get appointments by patient ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const appointments = await this.appointmentsService.findByPatientId(patientId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient appointments retrieved successfully',
      data: appointments
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointment found',
      data: appointment
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    const result = await this.appointmentsService.update(id, updateAppointmentDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.appointmentsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}