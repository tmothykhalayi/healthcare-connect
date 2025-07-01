import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Create a new order

  @Post()
  async create (@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService
      .create(createOrderDto)
      .then((order) => {
        return `Order with ID ${order.id} has been created`;
      })
      .catch((error) => {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');

      });
  }
// Find all orders
  @Get()
  async findAll(orderBy: string = 'orderDate', order: 'ASC' | 'DESC' = 'ASC') {
    return await this.ordersService.findAll(orderBy, order);
  }

  // Find orders by status
  @Get('status/:status')
  async findByStatus(
    @Param('status') status: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return await this.ordersService.findByStatus(status, orderBy, order);
  }
  // Find orders by patient ID
  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return await this.ordersService.findByPatientId(patientId, orderBy, order);
  } 

  // Find one order by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id)
      .then((order) => {
        if (!order) {
          return `No order found with ID ${id}`;
        }
        return order;
      })
      .catch((error) => {
        console.error('Error finding order:', error);
        throw new Error(`Failed to find order with ID ${id}`);
      });
  }

  // Update order status by ID
  @Patch(':id/status')  
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService
      .update(id, updateOrderDto)
      .then(() => {
        return `Order with ID ${id} has been updated`;
      })
      .catch((error) => {
        console.error('Error updating order:', error);
        throw new Error(`Failed to update order with ID ${id}`);
      });
  }

  // Delete an order by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ordersService
      .remove(id)
      .then((result) => {
        if (typeof result === 'object' && 'message' in result) {
          return result.message;
        }
        return `Order with ID ${id} has been deleted`;
      })
      .catch((error) => {
        console.error('Error deleting order:', error);
        throw new Error(`Failed to delete order with ID ${id}`);
      });
  } 

}