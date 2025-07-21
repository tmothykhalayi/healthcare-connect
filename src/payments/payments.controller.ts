import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpException,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
//@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  // Create a new payment

  @Post()
  ///@Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.paymentsService.create(createPaymentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Payment created successfully',
        data: payment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Get all payments
  @Get()
  ///@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all payments (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: [Payment],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    try {
      const result = await this.paymentsService.findAllPaginated(
        page,
        limit,
        search,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments retrieved successfully',
        ...result, // should include data and total
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Get payments by pharmacy ID
  @Get('pharmacy/:pharmacyId')
  @ApiOperation({ summary: 'Get payments by pharmacy ID' })
  @ApiParam({ name: 'pharmacyId', description: 'Pharmacy ID' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: [Payment],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findByPharmacyId(@Param('pharmacyId') pharmacyId: string) {
    try {
      const payments = await this.paymentsService.findByPharmacyId(
        Number(pharmacyId),
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Payments retrieved successfully',
        data: payments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  // Get a payment by ID
  @Get(':id')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findOne(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.findOne(Number(id));
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Update a payment by ID
  @Put(':id')
  //@Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Update a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: String,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    try {
      const payment = await this.paymentsService.update(
        Number(id),
        updatePaymentDto,
      );
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment updated successfully',
        data: payment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete a payment by ID
  @Delete(':id')
  //@Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment deleted successfully',
    type: String,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async remove(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.remove(Number(id));
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment deleted successfully',
        data: payment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
