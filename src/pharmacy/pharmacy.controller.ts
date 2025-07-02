import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}
  // Get all pharmacies
  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  //get all pharmacies
  @Get()
  async findAll() {
    return this.pharmacyService.findAll();
  }


  //get one by id 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(+id);
  }

  //update by id 
  async update(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacyService.update(+id, updatePharmacyDto);
  }



  //delete a pharmacies
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pharmacyService.remove(+id);
  }



}