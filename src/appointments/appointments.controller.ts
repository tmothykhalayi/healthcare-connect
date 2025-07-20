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
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UserRole, Users } from '../users/entities/user.entity';
//import { AtGuard, RolesGuard } from '../auth/guards';
//import { Roles } from '../auth/decorators/roles.decorator';
//import { Role } from '../auth/enums/role.enum';
import { GetCurrentUserId } from '../auth/decorators/get-current-user-id.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('appointments')
//@ApiBearerAuth()
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
      throw error;
    }
  }

  @Get('doctor')
  //@Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointments for the current doctor' })
  async findByCurrentDoctor(@GetCurrentUserId() userId: number) {
    const appointments =
      await this.appointmentsService.findByCurrentDoctor(userId);
    return {
      statusCode: 200,
      message: 'Appointments for the current doctor retrieved successfully',
      data: appointments,
    };
  }

  @Get('doctor/:doctorId')
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
  ///@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all appointments (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = ''
  ) {
    const result = await this.appointmentsService.findAllPaginated(page, limit, search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Appointments retrieved successfully',
      ...result, // should include data and total
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
  // @Roles(Role.ADMIN)
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
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get appointments by status' })
  @ApiParam({ name: 'status', description: 'Appointment status' })
  async findByStatus(@Param('status') status: string) {
    const appointments = await this.appointmentsService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Appointments with status '${status}' retrieved successfully`,
      data: appointments,
    };
  }

  @Get('patient/:patientId')
  //@Roles(Role.ADMIN)
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
  //@Roles(Role.ADMIN)
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
  //@Roles(Role.ADMIN)
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
      ...result,
    };
  }

  @Delete(':id')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.appointmentsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

//get by patient id
  @Get('patient')
  //@Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get appointments by patient ID' })
  @ApiQuery({ name: 'patientId', required: true, type: Number })
  async findByPatient(
    @Query('patientId', ParseIntPipe) patientId: number,
    @Req() request: Request,
  ) {
    const appointments =
      await this.appointmentsService.findByPatientId(patientId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient appointments retrieved successfully',
      data: appointments,
    };
  } 
}
