import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { Users } from '../users/entities/user.entity';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('patients')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
export class PatientsController {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async create(@Body() createPatientDto: CreatePatientDto, @Req() req) {
    const currentUser = req.user;
    if (currentUser.role === Role.PATIENT) {
      throw new HttpException(
        'Patients cannot create other patients',
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const patient = await this.patientsRepository.save(
        createPatientDto as any,
      );
      return `Patient with ID ${patient.id} has been created`;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new HttpException(
        'Failed to create patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  //@Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  async findAll(@Req() req) {
    const currentUser = req.user;

    if (currentUser.role === Role.PATIENT) {
      // Patient: only get own patient record
      return await this.patientsRepository.find({
        where: { userId: currentUser.id },
        relations: ['user'],
        select: {
          id: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          medicalHistory: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });
    }

    if (currentUser.role === Role.DOCTOR) {
      // Doctor: get patients assigned to their pharmacy
      const pharmacyId = currentUser.pharmacyId;
      if (!pharmacyId) {
        throw new HttpException(
          'Pharmacy ID not found for doctor',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.patientsRepository
        .createQueryBuilder('patient')
        .leftJoinAndSelect('patient.user', 'user')
        .leftJoin('patient.pharmacy', 'pharmacy')
        .where('pharmacy.id = :pharmacyId', { pharmacyId })
        .select([
          'patient.id',
          'patient.phoneNumber',
          'patient.address',
          'patient.dateOfBirth',
          'patient.medicalHistory',
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
        ])
        .getMany();
    }

    if (currentUser.role === Role.ADMIN) {
      // Admin: get all patients
      return await this.patientsRepository.find({
        relations: ['user'],
        select: {
          id: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          medicalHistory: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });
    }

    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  @Get('pharmacy/:pharmacyId')
  @ApiOperation({ summary: 'Get patients by pharmacy ID' })
  @ApiParam({ name: 'pharmacyId', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  async findByPharmacyId(@Param('pharmacyId') pharmacyId: string) {
    try {
      const patients = await this.patientsRepository
        .createQueryBuilder('patient')
        .leftJoinAndSelect('patient.user', 'user')
        .leftJoin('patient.pharmacy', 'pharmacy')
        .where('pharmacy.id = :pharmacyId', { pharmacyId: parseInt(pharmacyId) })
        .select([
          'patient.id',
          'patient.phoneNumber',
          'patient.address',
          'patient.dateOfBirth',
          'patient.medicalHistory',
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
        ])
        .getMany();

      return {
        statusCode: HttpStatus.OK,
        message: 'Patients retrieved successfully',
        data: patients,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ['user'],
        select: {
          id: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          medicalHistory: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });

      if (!patient) {
        throw new HttpException(
          `No patient found with ID ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return patient;
    } catch (error) {
      console.error('Error finding patient:', error);
      throw new HttpException(
        `Failed to find patient with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    try {
      await this.patientsRepository.update(
        { id: parseInt(id, 10) },
        updatePatientDto,
      );
      return `Patient with ID ${id} has been updated`;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new HttpException(
        `Failed to update patient with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.patientsRepository.delete({
        id: parseInt(id, 10),
      });
      if (result.affected === 0) {
        throw new HttpException(
          `No patient found with ID ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return `Patient with ID ${id} has been deleted`;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new HttpException(
        `Failed to delete patient with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
