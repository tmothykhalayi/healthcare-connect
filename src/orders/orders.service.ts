import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Pharmacy } from '../pharmacy/entities/pharmacy.entity';
import { PharmacyMedicine } from '../pharmacy/entities/pharmacy-medicine.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(PharmacyMedicine)
    private pharmacyMedicineRepository: Repository<PharmacyMedicine>,
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

    // If medicine is specified, check stock availability
    if (createOrderDto.medicineId && createOrderDto.quantity) {
      await this.validateMedicineStock(
        createOrderDto.pharmacyId,
        createOrderDto.medicineId,
        createOrderDto.quantity,
      );
    }

    // Create the order entity
    const newOrder = this.ordersRepository.create({
      patientId: createOrderDto.patientId,
      pharmacyId: createOrderDto.pharmacyId,
      medicineId: createOrderDto.medicineId,
      quantity: createOrderDto.quantity || 1,
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

  // Find all orders with pagination and search
  async findAllPaginated(page = 1, limit = 10, search = ''): Promise<{ data: Order[]; total: number }> {
    console.log(`[OrdersService] Fetching orders - page: ${page}, limit: ${limit}, search: "${search}"`);
    
    try {
      const query = this.ordersRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.patient', 'patient')
        .leftJoinAndSelect('order.pharmacy', 'pharmacy')
        .leftJoinAndSelect('patient.user', 'patientUser')
        .leftJoinAndSelect('pharmacy.user', 'pharmacyUser');

      if (search) {
        query.where('order.status LIKE :search OR order.OrderId LIKE :search OR patientUser.firstName LIKE :search OR patientUser.lastName LIKE :search OR pharmacyUser.firstName LIKE :search OR pharmacyUser.lastName LIKE :search', { search: `%${search}%` });
      }

      const [data, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.orderDate', 'DESC')
        .getManyAndCount();

      console.log(`[OrdersService] Found ${data.length} orders out of ${total} total`);
      
      if (data.length > 0) {
        console.log('[OrdersService] Sample order data:', {
          id: data[0].id,
          patientId: data[0].patientId,
          pharmacyId: data[0].pharmacyId,
          status: data[0].status,
          OrderId: data[0].OrderId,
          patientName: data[0].patient ? `${data[0].patient.user?.firstName || ''} ${data[0].patient.user?.lastName || ''}`.trim() : '',
          pharmacyName: data[0].pharmacy ? `${data[0].pharmacy.user?.firstName || ''} ${data[0].pharmacy.user?.lastName || ''}`.trim() : '',
        });
      } else {
        console.log('[OrdersService] No orders found in database');
      }

      return { data, total };
    } catch (error) {
      console.error('[OrdersService] Error fetching orders:', error);
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

  // Update order status and reduce stock if completed
  async updateStatus(id: string, status: string): Promise<{ message: string }> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['medicine'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const previousStatus = order.status;
      order.status = status;

      // If status is being updated to 'completed' and it wasn't completed before
      if (status === 'completed' && previousStatus !== 'completed') {
        // Reduce stock if medicine is specified
        if (order.medicineId && order.quantity) {
          await this.reduceMedicineStock(order.pharmacyId, order.medicineId, order.quantity);
        }
      }

      await this.ordersRepository.save(order);

      return {
        message: `Order status updated to ${status} successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating order status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  // Reduce medicine stock in pharmacy
  private async reduceMedicineStock(
    pharmacyId: number,
    medicineId: number,
    quantity: number,
  ): Promise<void> {
    try {
      // Find the pharmacy medicine record
      const pharmacyMedicine = await this.pharmacyMedicineRepository.findOne({
        where: { pharmacyId, medicineId },
      });

      if (!pharmacyMedicine) {
        throw new BadRequestException(
          `Medicine ${medicineId} is not available in pharmacy ${pharmacyId}`,
        );
      }

      // Check if enough stock is available
      if (pharmacyMedicine.stockQuantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${pharmacyMedicine.stockQuantity}, Requested: ${quantity}`,
        );
      }

      // Reduce the stock
      pharmacyMedicine.stockQuantity -= quantity;

      // If stock goes below minimum level, mark as unavailable
      if (pharmacyMedicine.stockQuantity <= pharmacyMedicine.minimumStockLevel) {
        pharmacyMedicine.isAvailable = false;
      }

      await this.pharmacyMedicineRepository.save(pharmacyMedicine);

      console.log(
        `Stock reduced for medicine ${medicineId} in pharmacy ${pharmacyId}. New stock: ${pharmacyMedicine.stockQuantity}`,
      );
    } catch (error) {
      console.error('Error reducing medicine stock:', error);
      throw error;
    }
  }

  // Validate medicine stock availability
  private async validateMedicineStock(
    pharmacyId: number,
    medicineId: number,
    quantity: number,
  ): Promise<void> {
    try {
      const pharmacyMedicine = await this.pharmacyMedicineRepository.findOne({
        where: { pharmacyId, medicineId },
      });

      if (!pharmacyMedicine) {
        throw new BadRequestException(
          `Medicine ${medicineId} is not available in pharmacy ${pharmacyId}`,
        );
      }

      if (!pharmacyMedicine.isAvailable) {
        throw new BadRequestException(
          `Medicine ${medicineId} is currently unavailable in pharmacy ${pharmacyId}`,
        );
      }

      if (pharmacyMedicine.stockQuantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${pharmacyMedicine.stockQuantity}, Requested: ${quantity}`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error validating medicine stock:', error);
      throw new InternalServerErrorException('Failed to validate medicine stock');
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
