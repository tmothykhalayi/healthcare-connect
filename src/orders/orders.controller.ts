import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards , Logger, UnauthorizedException,ParseIntPipe ,HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AtGuard, RolesGuard } from '../auth/guards';
import { UserRole } from '../users/entities/user.entity';


import { Role } from '../auth/enums/role.enum';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN ,Role.PHARMACY)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 409, description: 'Order already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.ordersService.create(createOrderDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Order created successfully',
        data: order
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles(Role.ADMIN,Role.PHARMACY)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(orderBy: string = 'orderDate', order: 'ASC' | 'DESC' = 'ASC') {
    const orders = await this.ordersService.findAll(orderBy, order);
    return {
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: orders
    };
  }
@Roles(Role.ADMIN,Role.PHARMACY)
  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  @ApiParam({ name: 'status', description: 'Order status' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findByStatus(
    @Param('status') status: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const orders = await this.ordersService.findByStatus(status, orderBy, order);
    return {
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: orders
    };
  }
@Roles(Role.ADMIN)
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get orders by patient ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findByPatientId(
    @Param('patientId') patientId: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const orders = await this.ordersService.findByPatientId(patientId, orderBy, order);
    return {
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: orders
    };
  } 

  @Get(':id')
  @Roles(Role.ADMIN,Role.PHARMACY)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order found',
      data: order
    };
  }

  @Roles(Role.ADMIN,Role.PHARMACY)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    if (!updateOrderDto.status) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Status is required'
      };
    }
    
    const result = await this.ordersService.updateStatus(id, updateOrderDto.status);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }


  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const result = await this.ordersService.update(id, updateOrderDto);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  }

  @Roles(Role.ADMIN ,Role.PHARMACY)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id') id: string) {
    const result = await this.ordersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result
    };
  } 
}
