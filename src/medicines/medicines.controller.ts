import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@ApiTags('medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid medicine data' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines' })
  @ApiResponse({ status: 200, description: 'Medicines retrieved successfully' })
  findAll() {
    return this.medicinesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get medicine statistics' })
  @ApiResponse({ status: 200, description: 'Medicine statistics retrieved successfully' })
  getStats() {
    return this.medicinesService.getMedicineStats();
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Get medicines expiring soon' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to check (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring medicines retrieved successfully' })
  findExpiringSoon(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.medicinesService.findExpiringSoon(daysNumber);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get medicines with low stock' })
  @ApiResponse({ status: 200, description: 'Low stock medicines retrieved successfully' })
  findLowStock() {
    return this.medicinesService.findLowStock();
  }

  @Get('prescription')
  @ApiOperation({ summary: 'Get prescription medicines' })
  @ApiResponse({ status: 200, description: 'Prescription medicines retrieved successfully' })
  findPrescriptionMedicines() {
    return this.medicinesService.findPrescriptionMedicines();
  }

  @Get('otc')
  @ApiOperation({ summary: 'Get over-the-counter medicines' })
  @ApiResponse({ status: 200, description: 'OTC medicines retrieved successfully' })
  findOTCMedicines() {
    return this.medicinesService.findOTCMedicines();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search medicines' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchMedicines(@Query('q') query: string) {
    return this.medicinesService.searchMedicines(query);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get medicines by category' })
  @ApiParam({ name: 'category', description: 'Medicine category' })
  @ApiResponse({ status: 200, description: 'Medicines by category retrieved successfully' })
  findByCategory(@Param('category') category: string) {
    return this.medicinesService.findByCategory(category);
  }

  @Get('manufacturer/:manufacturer')
  @ApiOperation({ summary: 'Get medicines by manufacturer' })
  @ApiParam({ name: 'manufacturer', description: 'Medicine manufacturer' })
  @ApiResponse({ status: 200, description: 'Medicines by manufacturer retrieved successfully' })
  findByManufacturer(@Param('manufacturer') manufacturer: string) {
    return this.medicinesService.findByManufacturer(manufacturer);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get medicines by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Medicines by user retrieved successfully' })
  findByUserId(@Param('userId') userId: string) {
    return this.medicinesService.findByUserId(+userId);
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Get medicines by price range' })
  @ApiQuery({ name: 'min', description: 'Minimum price' })
  @ApiQuery({ name: 'max', description: 'Maximum price' })
  @ApiResponse({ status: 200, description: 'Medicines by price range retrieved successfully' })
  findByPriceRange(@Query('min') min: string, @Query('max') max: string) {
    return this.medicinesService.findByPriceRange(+min, +max);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine found' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(+id, updateMedicineDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update medicine stock' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  updateStock(@Param('id') id: string, @Body() stockData: { quantity: number }) {
    return this.medicinesService.updateStock(+id, stockData.quantity);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update medicine status' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Body() statusData: { status: string }) {
    return this.medicinesService.updateStatus(+id, statusData.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID' })
  @ApiResponse({ status: 200, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(+id);
  }
}
