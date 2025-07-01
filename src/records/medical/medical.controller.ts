import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { UpdateMedicalDto } from './dto/update-medical.dto';

@Controller('medical')
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  @Post()
  create(@Body() createMedicalDto: CreateMedicalDto) {
    return this.medicalService.create(createMedicalDto);
  }

  @Get()
  findAll() {
    return this.medicalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalDto: UpdateMedicalDto) {
    return this.medicalService.update(+id, updateMedicalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalService.remove(+id);
  }
}
