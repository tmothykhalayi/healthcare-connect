import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('pharmacy')
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // Create new pharmacy
  @Post()
  @ApiOperation({ summary: 'Create a new pharmacy' })
  @ApiResponse({ status: 201, description: 'Pharmacy created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid pharmacy data' })
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  //get all pharmacies
  @Get()
  @ApiOperation({ summary: 'Get all pharmacies' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by pharmacy status',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({
    name: 'delivery',
    required: false,
    description: 'Filter by delivery availability',
  })
  @ApiResponse({
    status: 200,
    description: 'Pharmacies retrieved successfully',
  })
  async findAll(
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('delivery') delivery?: string,
  ) {
    return this.pharmacyService.findAll();
  }

  // Get pharmacy by user ID
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get pharmacy by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy found' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  async findByUserId(@Param('userId') userId: string) {
    return this.pharmacyService.findByUserId(+userId);
  }

  // Search pharmacies by name
  @Get('search')
  @ApiOperation({ summary: 'Search pharmacies by name' })
  @ApiQuery({ name: 'name', description: 'Pharmacy name to search' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchByName(@Query('name') name: string) {
    return this.pharmacyService.searchByName(name);
  }

  // Get pharmacies with delivery service
  @Get('delivery')
  @ApiOperation({ summary: 'Get pharmacies with delivery service' })
  @ApiQuery({
    name: 'available',
    description: 'Delivery availability (true/false)',
  })
  @ApiResponse({ status: 200, description: 'Pharmacies with delivery service' })
  async findWithDelivery(@Query('available') available: string) {
    const isAvailable = available === 'true';
    return this.pharmacyService.findWithDelivery(isAvailable);
  }

  // Get pharmacies by location
  @Get('location')
  @ApiOperation({ summary: 'Get pharmacies by location' })
  @ApiQuery({ name: 'city', description: 'City name' })
  @ApiResponse({ status: 200, description: 'Pharmacies in specified location' })
  async findByLocation(@Query('city') city: string) {
    return this.pharmacyService.findByLocation(city);
  }

  //get one by id
  @Get(':id')
  @ApiOperation({ summary: 'Get pharmacy by ID' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy found' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  async findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(+id);
  }

  //update by id
  @Patch(':id')
  @ApiOperation({ summary: 'Update pharmacy by ID' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy updated successfully' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    return this.pharmacyService.update(+id, updatePharmacyDto);
  }

  // Update pharmacy status
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update pharmacy status' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string },
  ) {
    return this.pharmacyService.updateStatus(+id, statusDto.status);
  }

  // Get pharmacy statistics
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy statistics' })
  async getStats(@Param('id') id: string) {
    return this.pharmacyService.getStats(+id);
  }

  //delete a pharmacy
  @Delete(':id')
  @ApiOperation({ summary: 'Delete pharmacy by ID' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  async remove(@Param('id') id: string) {
    return this.pharmacyService.remove(+id);
  }
}
