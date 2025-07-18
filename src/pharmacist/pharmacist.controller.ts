import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PharmacistService } from './pharmacist.service';
import { CreatePharmacistDto } from './dto/create-pharmacist.dto';
import { UpdatePharmacistDto } from './dto/update-pharmacist.dto';

@Controller('pharmacists')
export class PharmacistController {
  constructor(private readonly pharmacistService: PharmacistService) {}

  // Create a new pharmacist
  @Post()
  async create(@Body() createPharmacistDto: CreatePharmacistDto) {
    return this.pharmacistService.createPharmacist(
      createPharmacistDto.userId,
      createPharmacistDto.licenseNumber,
      createPharmacistDto.pharmacyId,
    );
  }

  // Get all pharmacists
  @Get()
  async findAll() {
    return this.pharmacistService.findAll();
  }

  // Get pharmacist by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pharmacist = await this.pharmacistService.findOne(+id);
    if (!pharmacist) {
      throw new NotFoundException(`Pharmacist with id ${id} not found`);
    }
    return pharmacist;
  }

  // Update pharmacist by ID
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePharmacistDto: UpdatePharmacistDto,
  ) {
    return this.pharmacistService.update(+id, updatePharmacistDto);
  }

  // Delete pharmacist by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pharmacistService.remove(+id);
  }
}
