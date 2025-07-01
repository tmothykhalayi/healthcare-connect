import { Injectable } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  //create a new doctor 
  @Post()
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
        data: doctor
      };
    } catch (error) {
      throw error;
    }
  }

  //find all doctors
  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  async findAll() {
    const doctors = await this.doctorsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctors retrieved successfully',
      data: doctors
    };
  }

  //find one doctor
  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor found' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id') id: string) {
    const doctor = await this.doctorsService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Doctor found',
      data: doctor
    };
  }

  //update a doctor 
  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    const result = await this.doctorsService.update(+id, updateDoctorDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  //delete a doctor
  @Delete(':id')
  @ApiOperation({ summary: 'Delete doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async remove(@Param('id') id: string) {
    const result = await this.doctorsService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }
}