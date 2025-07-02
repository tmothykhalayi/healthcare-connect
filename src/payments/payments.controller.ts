import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  // Create a new payment

  @Post()

  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.paymentsService.create(createPaymentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Payment created successfully',
        data: payment
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Get all payments
  @Get()
  async findAll() {
    try {
      const payments = await this.paymentsService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments retrieved successfully',
        data: payments
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  // Get a payment by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.findOne(Number(id));
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment retrieved successfully',
        data: payment
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  } 

  // Update a payment by ID
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await this.paymentsService.update(Number(id), updatePaymentDto);
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment updated successfully',
        data: payment
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete a payment by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.remove(Number(id));
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment deleted successfully',
        data: payment
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  // Get payments by user ID
  @Get('user/:userId')  
  async findByUserId(@Param('userId') userId: string) {
    try {
      const payments = await this.paymentsService.findByUserId(Number(userId));
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments retrieved successfully',
        data: payments
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}