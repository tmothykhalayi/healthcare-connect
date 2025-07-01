
import { Injectable } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';

@Controller('doctors')
export class DoctorsController {
  constructor (
        @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    ){}

  //create a new doctor 
  @Post()
  async create (createDoctorDto: CreateDoctorDto) {
    return await this.doctorRepository
      .save(createDoctorDto)
      .then((doctor) => {
        return `Doctor with license number ${doctor.licenseNumber} has been created`;
      })
      .catch((error) => {
        console.error('Error creating doctor:', error);
        throw new Error('Failed to create doctor');
      });
    
  }

  //find all doctors
  @Get()
  async findAll(specialisation?: string) {
    if (specialisation) {
      return await this.doctorRepository.find({
        where: { specialisation: specialisation },
      });
    }
    return await this.doctorRepository.find({
      relations: ['users'], 
    });
  }

  //find one doctor
  @Get(':licenseNumber')
  async findOne(@Param('licenseNumber') licenseNumber: string) {
    return await this.doctorRepository
      .findOne({
        where: { licenseNumber },
        relations: ['users'],
      })
      .then((doctor) => {
        if (!doctor) {
          return `No doctor found with license number ${licenseNumber}`;
        }
        return doctor;
      })
      .catch((error) => {
        console.error('Error finding doctor:', error);
        throw new Error(`Failed to find doctor with license number ${licenseNumber}`);
      });
  }

  //update a doctor 
  @Patch(':licenseNumber')
  async update(
    @Param('licenseNumber') licenseNumber: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ): Promise<string> {
    return await this.doctorRepository
      .update({ licenseNumber }, updateDoctorDto)
      .then(() => {
        return `Doctor with license number ${licenseNumber} has been updated`;
      })
      .catch((error) => {
        console.error('Error updating doctor:', error);
        throw new Error(`Failed to update doctor with license number ${licenseNumber}`);
      });
  }

  //delete a doctor
  @Delete(':licenseNumber')
  async remove(@Param('licenseNumber') licenseNumber: string): Promise<string> {
    return await this.doctorRepository
      .delete({ licenseNumber })
      .then((result) => {
        if (result.affected === 0) {
          return `No doctor found with license number ${licenseNumber}`;
        }
        return `Doctor with license number ${licenseNumber} has been removed`;
      })
      .catch((error) => {
        console.error('Error removing doctor:', error);
        throw new Error(`Failed to remove doctor with license number ${licenseNumber}`);
      });
  }
}