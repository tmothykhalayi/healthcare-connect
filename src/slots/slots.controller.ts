import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot' })
  @ApiResponse({ status: 201, description: 'Slot created successfully' })
  async create(@Body() createSlotDto: CreateSlotDto) {
    const slot = await this.slotsService.create(createSlotDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Slot created successfully',
      data: slot,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all slots' })
  async findAll() {
    const slots = await this.slotsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Slots retrieved successfully',
      data: slots,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a slot by ID' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const slot = await this.slotsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Slot found',
      data: slot,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a slot' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSlotDto: UpdateSlotDto,
  ) {
    const slot = await this.slotsService.update(id, updateSlotDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Slot updated successfully',
      data: slot,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slot' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.slotsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
