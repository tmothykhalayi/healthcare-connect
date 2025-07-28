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
  HttpCode,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User as UserDecorator } from 'src/auth/decorators/user';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {Role } from 'src/auth/enums/role.enum';
import { Users } from 'src/users/entities/user.entity';
import { AtGuard } from 'src/auth/guards/at.guard';


@ApiTags('payments')
@Controller('payments')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  // Create a new payment


  @Post('initialize')
  //@Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Initialize a new payment' })
  @ApiResponse({ status: 201, description: 'Payment initialized successfully' })
  async initializePayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.initializePayment(createPaymentDto, user);
  }

  @Post('verify/:reference')
  @UseGuards() // Remove authentication for this endpoint
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment verification completed' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.PHARMACIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.updatePaymentStatus(id, status as any);
  }

  @Get()
  @Roles(Role.PATIENT, Role.ADMIN)
  @ApiOperation({ summary: 'Get all payments for user' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async listPayments(@UserDecorator() user: Users) {
    return this.paymentsService.listPayments(user);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Get all payments (Admin and Pharmacist)' })
  @ApiResponse({ status: 200, description: 'All payments retrieved successfully' })
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('pharmacy/:pharmacyId')
  @Roles(Role.PHARMACIST, Role.ADMIN)
  @ApiOperation({ summary: 'Get payments for a specific pharmacy' })
  @ApiResponse({ status: 200, description: 'Pharmacy payments retrieved successfully' })
  async getPaymentsByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.paymentsService.getPaymentsByPharmacy(+pharmacyId);
  }

  @Get(':id')
  @Roles(Role.PATIENT, Role.ADMIN)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  async getPaymentById(
    @Param('id') id: string,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.getPaymentById(id, user);
  }

  @Post(':id/refund')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(
    @Param('id') id: string,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.refundPayment(id, user);
  }

  @Patch(':id/cancel')
  @Roles(Role.PATIENT,Role.ADMIN)
  @ApiOperation({ summary: 'Cancel a pending payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  async cancelPayment(
    @Param('id') id: string,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.cancelPayment(id, user);
  }

  @Patch(':id')
  @Roles(Role.PATIENT, Role.ADMIN)
  @ApiOperation({ summary: 'Update payment details' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.updatePayment(id, updatePaymentDto, user);
  }

  @Delete(':id')
  @Roles(Role.PATIENT, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a payment record' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  async deletePayment(
    @Param('id') id: string,
    @UserDecorator() user: Users
  ) {
    return this.paymentsService.deletePayment(id, user);
  }

  // @Delete('admin/:id')
  // @Roles(Role.ADMIN)
  // @ApiOperation({ summary: 'Delete a payment record (Admin only)' })
  // @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  // async deletePaymentAdmin(
  //   @Param('id') id: string
  // ) {
  //   return this.paymentsService.deletePaymentAdmin(id);
  // }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}