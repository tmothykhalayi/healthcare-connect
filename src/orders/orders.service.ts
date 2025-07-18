import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  // Create a new order
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if patient exists
    const patient = await this.patientsRepository.findOne({
      where: { id: createOrderDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createOrderDto.patientId} not found`,
      );
    }

    // Check if pharmacy exists
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id: createOrderDto.pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException(
        `Pharmacy with ID ${createOrderDto.pharmacyId} not found`,
      );
    }

    // Check if OrderId already exists
    const existingOrder = await this.ordersRepository.findOne({
      where: { OrderId: createOrderDto.OrderId },
    });

    if (existingOrder) {
      throw new ConflictException(
        `Order with OrderId ${createOrderDto.OrderId} already exists`,
      );
    }

    // Create the order entity
    const newOrder = this.ordersRepository.create({
      patientId: createOrderDto.patientId,
      pharmacyId: createOrderDto.pharmacyId,
      orderDate: new Date(createOrderDto.orderDate),
      status: createOrderDto.status,
      totalAmount: createOrderDto.totalAmount,
      OrderId: createOrderDto.OrderId,
    });

    try {
      return await this.ordersRepository.save(newOrder);
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  //find all orders
  async findAll(
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Partial<Order>[]> {
    try {
      const orders = await this.ordersRepository.find({
        relations: ['patient', 'patient.user'],
        order: { [orderBy]: order },
      });

      // Remove patient info before returning
      return orders.map(({ patient, ...order }) => order);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve orders');
    }
  }

  // Find one order by ID with patient information
  async findOne(id: string): Promise<Partial<Order>> {
    const order = await this.ordersRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['patient', 'patient.user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Exclude patient from the returned object
    const { patient, ...orderWithoutPatient } = order;
    return orderWithoutPatient;
  }

  // Find orders by status with patient information
  async findByStatus(
    status: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Order[]> {
    try {
      return await this.ordersRepository.find({
        where: { status },
        relations: ['patient', 'patient.user'],
        order: { [orderBy]: order },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve orders by status',
      );
    }
  }

  // Find orders by patient ID with patient information
  async findByPatientId(
    patientId: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Partial<Order>[]> {
    try {
      const orders = await this.ordersRepository.find({
        where: { patientId: parseInt(patientId) },
        relations: ['patient', 'patient.user'],
        order: { [orderBy]: order },
      });

      // Strip out patient info from each order
      return orders.map(
        ({ patient, ...orderWithoutPatient }) => orderWithoutPatient,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve orders by patient ID',
      );
    }
  }

  // Find orders by pharmacy ID with patient information
  async findByPharmacyId(
    pharmacyId: string,
    orderBy: string = 'orderDate',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Partial<Order>[]> {
    try {
      const orders = await this.ordersRepository.find({
        where: { pharmacyId: parseInt(pharmacyId) },
        relations: ['patient', 'patient.user'],
        order: { [orderBy]: order },
      });

      // Strip out patient info from each order
      return orders.map(
        ({ patient, ...orderWithoutPatient }) => orderWithoutPatient,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve orders by pharmacy ID',
      );
    }
  }

  // Update an order by ID
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<{ message: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // If patientId is being updated, check if the new patient exists
    if (updateOrderDto.patientId) {
      const patient = await this.patientsRepository.findOne({
        where: { id: updateOrderDto.patientId },
      });
      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${updateOrderDto.patientId} not found`,
        );
      }
    }

    // Convert orderDate if provided
    if (updateOrderDto.orderDate) {
      updateOrderDto.orderDate = new Date(
        updateOrderDto.orderDate,
      ).toISOString();
    }

    Object.assign(order, updateOrderDto);

    try {
      await this.ordersRepository.save(order);
      return { message: `Order with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  // Update order status by ID
  async updateStatus(id: string, status: string): Promise<{ message: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;

    try {
      await this.ordersRepository.save(order);
      return { message: `Order status with ID ${id} updated successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  // Delete an order by ID
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.ordersRepository.delete({ id: parseInt(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: `Order with ID ${id} deleted successfully` };
  }

  // Delete orders by patient ID
  async removeByPatientId(patientId: string): Promise<{ message: string }> {
    const result = await this.ordersRepository.delete({
      patientId: parseInt(patientId),
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `No orders found for patient ID ${patientId}`,
      );
    }
    return {
      message: `Orders for patient ID ${patientId} deleted successfully`,
    };
  }

  // Delete order by OrderId
  async removeByOrderId(orderId: string): Promise<{ message: string }> {
    const result = await this.ordersRepository.delete({ OrderId: orderId });
    if (result.affected === 0) {
      throw new NotFoundException(`Order with Order ID ${orderId} not found`);
    }
    return { message: `Order with Order ID ${orderId} deleted successfully` };
  }

  // Count total orders
  async count(): Promise<number> {
    return await this.ordersRepository.count();
  }
}
