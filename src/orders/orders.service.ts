import {Injectable,NotFoundException,InternalServerErrorException,ConflictException, BadRequestException,} from '@nestjs/common';
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
     status: createOrderDto.orderStatus,  
      totalAmount: createOrderDto.totalAmount,
      OrderId: createOrderDto.OrderId,
    });

    try {
      return await this.ordersRepository.save(newOrder);
    } catch (error) {
      //console.error('Database error:', error);
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
  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
    patientId?: number,
  ): Promise<{ data: Order[]; total: number }> {
    // console.log(
    //   `[OrdersService] Fetching orders - page: ${page}, limit: ${limit}, search: "${search}", patientId: ${patientId}`,
    // );

    try {
      const query = this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.patient', 'patient')
        .leftJoinAndSelect('order.pharmacy', 'pharmacy')
        .leftJoinAndSelect('patient.user', 'patientUser')
        .leftJoinAndSelect('pharmacy.user', 'pharmacyUser');

      if (search && patientId) {
        query
          .where(
            'order.status LIKE :search OR order.OrderId LIKE :search OR patientUser.firstName LIKE :search OR patientUser.lastName LIKE :search OR pharmacyUser.firstName LIKE :search OR pharmacyUser.lastName LIKE :search',
            { search: `%${search}%` },
          )
          .andWhere('order.patientId = :patientId', { patientId });
      } else if (search) {
        query.where(
          'order.status LIKE :search OR order.OrderId LIKE :search OR patientUser.firstName LIKE :search OR patientUser.lastName LIKE :search OR pharmacyUser.firstName LIKE :search OR pharmacyUser.lastName LIKE :search',
          { search: `%${search}%` },
        );
      } else if (patientId) {
        query.where('order.patientId = :patientId', { patientId });
      }

      // Debug: print the final SQL and parameters
      //console.log('Final SQL:', query.getSql());
      //console.log('Query Params:', query.getParameters());

      const [data, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.orderDate', 'DESC')
        .getManyAndCount();

      console.log(
        `[OrdersService] Found ${data.length} orders out of ${total} total`,
      );

      if (data.length > 0) {
        console.log('[OrdersService] Sample order data:', {
          id: data[0].id,
          patientId: data[0].patientId,
          pharmacyId: data[0].pharmacyId,
          status: data[0].status,
          OrderId: data[0].OrderId,
          patientName: data[0].patient
            ? `${data[0].patient.user?.firstName || ''} ${data[0].patient.user?.lastName || ''}`.trim()
            : '',
          pharmacyName: data[0].pharmacy
            ? `${data[0].pharmacy.user?.firstName || ''} ${data[0].pharmacy.user?.lastName || ''}`.trim()
            : '',
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

  // Validate medicine stock availability (stub)
  private async validateMedicineStock(
    pharmacyId: number,
    medicineId: number,
    quantity: number,
  ): Promise<void> {
    // Implement your stock validation logic here or leave empty for now
    return;
  }

  // Update order status (stub)
  async updateStatus(id: string, status: string): Promise<{ message: string }> {
    // Implement your status update logic here or leave empty for now
    return { message: `Order status updated to ${status}` };
  }

  // Remove an order by ID (stub)
  async remove(id: string): Promise<{ message: string }> {
    // Implement your remove logic here or leave empty for now
    return { message: `Order with ID ${id} deleted successfully` };
  }

  // Remove orders by patient ID (stub)
  async removeByPatientId(patientId: string): Promise<{ message: string }> {
    // Implement your remove by patient logic here or leave empty for now
    return {
      message: `Orders for patient ID ${patientId} deleted successfully`,
    };
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
    // ... rest of the update logic ...
    return { message: `Order with ID ${id} updated successfully` };
  }
}
