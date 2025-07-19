import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get()
  async findAll() {
    return this.prescriptionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const prescription = await this.prescriptionService.findOne(+id);
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(+id, updatePrescriptionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionService.remove(+id);
  }
}
