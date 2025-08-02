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
  ConflictException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
//import { Roles } from '../auth/decorators/roles.decorator';
//import { Role } from '../auth/enums/role.enum';
//import { AtGuard, RolesGuard } from '../auth/guards';
import { GetCurrentUserId } from '../auth/decorators/get-current-user-id.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('appointments')
@ApiBearerAuth()
//@UseGuards(AtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      const appointment =
        await this.appointmentsService.create(createAppointmentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Appointment created successfully',
        data: appointment,
      };
    } catch (error) {
      if (error.code === 'SCHEDULING_CONFLICT') {
        throw new ConflictException(
          'Scheduling conflict: appointment overlaps',
        );
      }
      throw error;
    }
  }

  @Get('doctor')
  // @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointments for the current doctor' })
  async findByCurrentDoctor(@GetCurrentUserId() userId: number) {
    const appointments =
      await this.appointmentsService.findByCurrentDoctor(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointments for the current doctor retrieved successfully',
      data: appointments,
    };
  }

  @Get('doctor/:doctorId')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get appointments by doctor ID' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  async findByDoctorId(@Param('doctorId', ParseIntPipe) doctorId: number) {
    const appointments =
      await this.appointmentsService.findByDoctorId(doctorId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctor appointments retrieved successfully',
      data: appointments,
    };
  }

  @Get()
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all appointments (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    const result = await this.appointmentsService.findAllPaginated(
      page,
      limit,
      search,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointments retrieved successfully',
      ...result,
    };
  }

  @Get('today')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: "Get today's appointments" })
  async findToday() {
    const appointments = await this.appointmentsService.findToday();
    return {
      statusCode: HttpStatus.OK,
      message: "Today's appointments retrieved successfully",
      data: appointments,
    };
  }

  @Get('upcoming')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get upcoming appointments (next 7 days)' })
  async findUpcoming() {
    const appointments = await this.appointmentsService.findUpcoming();
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming appointments retrieved successfully',
      data: appointments,
    };
  }

  @Get('status/:status')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get appointments by status' })
  @ApiParam({ name: 'status', description: 'Appointment status' })
  async findByStatus(@Param('status') status: string) {
    const validStatuses = [
      'scheduled',
      'confirmed',
      'cancelled',
      'completed',
      'no_show',
      'rescheduled',
    ];
    if (!validStatuses.includes(status)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid status '${status}'. Valid statuses: ${validStatuses.join(', ')}`,
      };
    }
    const appointments = await this.appointmentsService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Appointments with status '${status}' retrieved successfully`,
      data: appointments,
    };
  }

  @Get('patient/:patientId')
  //@Roles(Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Get appointments by patient ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const appointments =
      await this.appointmentsService.findByPatientId(patientId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient appointments retrieved successfully',
      data: appointments,
    };
  }

  @Get(':id')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointment found',
      data: appointment,
    };
  }

  @Patch(':id')
  //@Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    const result = await this.appointmentsService.update(
      id,
      updateAppointmentDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointment updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.appointmentsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointment deleted successfully',
      data: result,
    };
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Manually send appointment reminder' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiQuery({
    name: 'type',
    description: 'Reminder type',
    enum: ['1-day', '1-hour'],
    required: false,
  })
  async sendReminder(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') reminderType: '1-day' | '1-hour' = '1-hour',
  ) {
    const result = await this.appointmentsService.sendManualReminder(
      id,
      reminderType,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  @Post('test-reminder-template')
  @ApiOperation({ summary: 'Test appointment reminder template' })
  @ApiQuery({ name: 'email', description: 'Email to send test reminder to' })
  async testReminderTemplate(@Query('email') email: string) {
    const result = await this.appointmentsService.testReminderTemplate(email);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }
}
