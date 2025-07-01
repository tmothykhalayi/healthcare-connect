import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
    constructor(@InjectRepository(Order) private ordersRepository: Repository<Order>) {}

    // Create a new order
    async create(createOrderDto: CreateOrderDto) {
        const newOrder = this.ordersRepository.create({
           patientId: createOrderDto.patientId,
            orderDate: createOrderDto.orderDate,
            status: createOrderDto.status,
            totalAmount: createOrderDto.totalAmount,
            OrderId: createOrderDto.OrderId
        });
        try{
            return await this.ordersRepository.save(newOrder);
        }
        catch (error) {
            throw new Error('Failed to create order');
        }
    }
    // Find all orders
    async findAll(orderBy: string = 'orderDate', order: 'ASC' | 'DESC' = 'ASC') {
        return await this.ordersRepository.find({
            order: { [orderBy]: order },
            relations: ['patient'], 
        });
    }

    // Find one order by ID
    async findOne(id: string) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['patient'], 
        });
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return order;
    }



    // Find orders by status
    async findByStatus(status: string, orderBy: string = 'orderDate', order: 'ASC' | 'DESC' = 'ASC') {
        return await this.ordersRepository.find({
            where: { status },
            order: { [orderBy]: order },
            relations: ['patient'], 
        });
    }       
    // Find orders by patient ID
    async findByPatientId(patientId: string, orderBy: string = 'orderDate', order: 'ASC' | 'DESC' = 'ASC') {
        return await this.ordersRepository.find({
            where: { patientId },
            order: { [orderBy]: order },
            relations: ['patient'], 
        });
    }   

    // Update an order by ID
    async update(id: string, updateOrderDto: UpdateOrderDto) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }

        Object.assign(order, updateOrderDto);
        try {
            return await this.ordersRepository.save(order);
        } catch (error) {
            throw new Error('Failed to update order');
        }
    }

    //update order status by ID
    async updateStatus(id: string, status: string) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }

        order.status = status;
        try {
            return await this.ordersRepository.save(order);
        } catch (error) {
            throw new Error('Failed to update order status');
        }
    }

    // Delete an order by ID
    async remove(id: string) {
        const result = await this.ordersRepository.delete({ id });
        if (result.affected === 0) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return { message: `Order with ID ${id} deleted successfully` };
    }

    // Delete orders by patient ID
    async removeByPatientId(patientId: string) {
        const result = await this.ordersRepository.delete({ patientId });
        if (result.affected === 0) {
            throw new Error(`No orders found for patient ID ${patientId}`);
        }
        return { message: `Orders for patient ID ${patientId} deleted successfully` };
    }   
    

    //delete order by orderId
    async removeByOrderId(orderId: string) {
        const result = await this.ordersRepository.delete({ OrderId: orderId });
        if (result.affected === 0) {
            throw new Error(`No orders found with Order ID ${orderId}`);
        }
        return { message: `Order with Order ID ${orderId} deleted successfully` };
    }
    

    // Count total orders
    async count() {
        return await this.ordersRepository.count();
    }   




  
}
