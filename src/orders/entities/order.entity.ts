import { Entity, PrimaryGeneratedColumn,  ManyToOne,
  JoinColumn,Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity'; 
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

   @Column()
  OrderId: string; 

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'processed', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Column('decimal')
  totalAmount: number;



  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


@ManyToOne(() => Patient, (patient) => patient.orders, { nullable: true })
@JoinColumn({ name: 'patientId' })
patient: Patient;

@Column({ nullable: true })
patientId: string;

}