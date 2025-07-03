import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { AtGuard,RolesGuard } from '../auth/guards';
import{Role} from '../auth/enums/role.enum'
import {Roles} from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(AtGuard , RolesGuard)
@ApiTags('medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid medicine data' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  
  @Get()
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Get all medicines' })
  @ApiResponse({ status: 200, description: 'Medicines retrieved successfully' })
  findAll() {
    return this.medicinesService.findAll();
  }

  @Get('stats')
  @Roles(Role.ADMIN )
  @ApiOperation({ summary: 'Get medicine statistics' })
  @ApiResponse({ status: 200, description: 'Medicine statistics retrieved successfully' })
  getStats() {
    return this.medicinesService.getMedicineStats();
  }

  
  @Get('expiring-soon')
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Get medicines expiring soon' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to check (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring medicines retrieved successfully' })
  findExpiringSoon(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.medicinesService.findExpiringSoon(daysNumber);
  }

  @Roles(Role.ADMIN)
  @Get('low-stock')
  @ApiOperation({ summary: 'Get medicines with low stock' })
  @ApiResponse({ status: 200, description: 'Low stock medicines retrieved successfully' })
  findLowStock() {
    return this.medicinesService.findLowStock();
  }

  
  @Get('prescription')
  @Roles(Role.ADMIN ,Role.PHARMACY ,Role.DOCTOR)
  @ApiOperation({ summary: 'Get prescription medicines' })
  @ApiResponse({ status: 200, description: 'Prescription medicines retrieved successfully' })
  async findPrescriptionMedicines() {
    return this.medicinesService.findPrescriptionMedicines();
  }

  @Get('otc')
  @Roles(Role.ADMIN ,Role.PHARMACY ,Role.DOCTOR ,Role.PATIENT)
  @ApiOperation({ summary: 'Get over-the-counter medicines' })
  @ApiResponse({ status: 200, description: 'OTC medicines retrieved successfully' })
  findOTCMedicines() {
    return this.medicinesService.findOTCMedicines();
  }
 
  @Get('search')
  @Roles(Role.ADMIN ,Role.PHARMACY  ,Role.DOCTOR)
  @ApiOperation({ summary: 'Search medicines' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchMedicines(@Query('q') query: string) {
    return this.medicinesService.searchMedicines(query);
  }

  @Get('category/:category')
  @Roles(Role.ADMIN ,Role.PHARMACY  ,Role.DOCTOR)
  @ApiOperation({ summary: 'Get medicines by category' })
  @ApiParam({ name: 'category', description: 'Medicine category' })
  @ApiResponse({ status: 200, description: 'Medicines by category retrieved successfully' })
  findByCategory(@Param('category') category: string) {
    return this.medicinesService.findByCategory(category);
  }

  @Get('manufacturer/:manufacturer')
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Get medicines by manufacturer' })
  @ApiParam({ name: 'manufacturer', description: 'Medicine manufacturer' })
  @ApiResponse({ status: 200, description: 'Medicines by manufacturer retrieved successfully' })
  findByManufacturer(@Param('manufacturer') manufacturer: string) {
    return this.medicinesService.findByManufacturer(manufacturer);
  }


  @Get('user/:userId')
@Roles(Role.ADMIN ,Role.PHARMACY ,Role.DOCTOR)
  @ApiOperation({ summary: 'Get medicines by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'doctorId', description: 'Doctor ID', required: true })
  @ApiResponse({ status: 200, description: 'Medicines by user retrieved successfully' })
  findByUserId(@Param('userId') userId: string, @Query('doctorId') doctorId: string) {
    return this.medicinesService.findByUserId(+userId, +doctorId);
  }

  
  @Get('price-range')
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Get medicines by price range' })
  @ApiQuery({ name: 'min', description: 'Minimum price' })
  @ApiQuery({ name: 'max', description: 'Maximum price' })
  @ApiResponse({ status: 200, description: 'Medicines by price range retrieved successfully' })
  findByPriceRange(@Query('min') min: string, @Query('max') max: string) {
    return this.medicinesService.findByPriceRange(+min, +max);
  }

  @Get(':id')
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine found' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.PHARMACY)
  @ApiOperation({ summary: 'Update medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(+id, updateMedicineDto);
  }

  @Patch(':id/stock')
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Update medicine stock' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  updateStock(@Param('id') id: string, @Body() stockData: { quantity: number }) {
    return this.medicinesService.updateStock(+id, stockData.quantity);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN )
  @ApiOperation({ summary: 'Update medicine status' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Body() statusData: { status: string }) {
    return this.medicinesService.updateStatus(+id, statusData.status);
  }


  @Roles(Role.ADMIN ,Role.PHARMACY ,Role.DOCTOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(+id);
  }
}
