import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Users } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  // Create a new payment
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const user = await this.usersRepository.findOne({
      where: { id: parseInt(createPaymentDto.userId) },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createPaymentDto.userId} not found`);
    }

    const newPayment = this.paymentRepository.create({
      ...createPaymentDto,
      user, // associate the user entity
    });

    return this.paymentRepository.save(newPayment);
  }

  // Get all payments
  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['user'],
    });
  }

  // Get a payment by ID
  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: id.toString() },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException(`No payment found with ID ${id}`);
    }

    return payment;
  }

  //get payments by user ID
  async findByUserId(userId: number): Promise<Payment[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const payments = await this.paymentRepository.find({
      where: { user },
      relations: ['user'],
    });
    if (payments.length === 0) {
      throw new NotFoundException(`No payments found for user with ID ${userId}`);
    }
    return payments;
  }
  // Update a payment
  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<string> {
    const result = await this.paymentRepository.update(id, updatePaymentDto);
    if (result.affected === 0) {
      throw new NotFoundException(`No payment found with ID ${id}`);
    }
    return `Payment with ID ${id} has been updated`;
  }

  // Delete a payment
  async remove(id: number): Promise<string> {
    const result = await this.paymentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No payment found with ID ${id}`);
    }
    return `Payment with ID ${id} has been removed`;
  }
}
