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
    try {
      const user = await this.usersRepository.findOne({
        where: { id: parseInt(createPaymentDto.userId) },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${createPaymentDto.userId} not found`);
      }
      
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        userId: user.id,
        relatedEntityId: parseInt(createPaymentDto.relatedEntityId),
      });
      const savedPayment = await this.paymentRepository.save(payment);
      
      return Array.isArray(savedPayment) ? savedPayment[0] : savedPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
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
      where: { id: id },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException(`No payment found with ID ${id}`);
    }

    return payment;
  
  }
  // Update a payment
  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<string> {
    // Create a clean payment update object with proper types
    const paymentToUpdate: Partial<Payment> = {};
    
    // Copy only the fields that exist in updatePaymentDto
    if (updatePaymentDto.amount !== undefined) {
      paymentToUpdate.amount = updatePaymentDto.amount;
    }
    
    if (updatePaymentDto.paymentMethod !== undefined) {
      paymentToUpdate.paymentMethod = updatePaymentDto.paymentMethod;
    }
    
    if (updatePaymentDto.status !== undefined) {
      paymentToUpdate.status = updatePaymentDto.status;
    }
    
    if (updatePaymentDto.relatedEntityType !== undefined) {
      paymentToUpdate.relatedEntityType = updatePaymentDto.relatedEntityType;
    }
    
    if (updatePaymentDto.relatedEntityId !== undefined) {
      paymentToUpdate.relatedEntityId = parseInt(updatePaymentDto.relatedEntityId);
    }
    
    if (updatePaymentDto.transactionId !== undefined) {
      paymentToUpdate.transactionId = updatePaymentDto.transactionId;
    }
    
    // Handle userId separately to convert from string to number
    if (updatePaymentDto.userId !== undefined) {
      const userId = parseInt(updatePaymentDto.userId);
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${updatePaymentDto.userId} not found`);
      }
      
      // Set userId as a number in the update object
      paymentToUpdate.userId = userId;
    }
    
    const result = await this.paymentRepository.update(id, paymentToUpdate);
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
