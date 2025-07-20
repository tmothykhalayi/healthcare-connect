import { Injectable, UseGuards, Query, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Delete,
  HttpStatus,
  
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
//import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';

@ApiTags('doctors')
//@UseGuards(AtGuard, RolesGuard)
//@ApiBearerAuth()
@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  //create a new doctor
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  @ApiResponse({ status: 409, description: 'Doctor already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    try {
      const doctor = await this.doctorsService.create(createDoctorDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Doctor created successfully',
        data: doctor,
      };
    } catch (error) {
      throw error;
    }
  }

  //find all doctors with pagination and search
  @Get()
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all doctors (paginated)' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = ''
  ) {
    const result = await this.doctorsService.findAllPaginated(page, limit, search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctors retrieved successfully',
      ...result, // should include data and total
    };
  }

  //find one doctor
  @Get(':id')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor found' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id') id: string) {
    const doctor = await this.doctorsService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctor found',
      data: doctor,
    };
  }

  //update a doctor
  @Patch(':id')
  //@Roles(Role.ADMIN , Role.DOCTOR)
  @ApiOperation({ summary: 'Update doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @Req() req: Request,
  ) {
    try {
      const currentUser = req.user as any;
      if (currentUser.role === Role.DOCTOR && currentUser.id !== +id) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'You can only update your own details',
        };
      }
      const result = await this.doctorsService.update(+id, updateDoctorDto);
      return {
        statusCode: HttpStatus.OK,
        ...result,
      };
    } catch (error) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      if (error instanceof NotFoundException) {
        status = HttpStatus.NOT_FOUND;
        message = error.message;
      } else if (error instanceof ConflictException) {
        status = HttpStatus.CONFLICT;
        message = error.message;
      } else if (error instanceof BadRequestException) {
        status = HttpStatus.BAD_REQUEST;
        message = error.message;
      } else if (error.message) {
        message = error.message;
      }
      return {
        statusCode: status,
        message,
      };
    }
  }

  //delete a doctor
  @Delete(':id')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async remove(@Param('id') id: string) {
    const result = await this.doctorsService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
