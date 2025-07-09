import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
import { Pharmacy } from '../../pharmacy/entities/pharmacy.entity';

@Entity('medicines')
export class Medicine {
  @ApiProperty({ description: 'Medicine unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID (foreign key to User - who added this medicine)',
  })
  @Column()
  userId: number;

  @ApiProperty({ description: 'User who added this medicine' })
  @ManyToOne(() => Users, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Medicine name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Medicine description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Medicine manufacturer' })
  @Column()
  manufacturer: string;

  @ApiProperty({ description: 'Medicine price' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Medicine expiry date' })
  @Column('date')
  expiryDate: Date;

  @ApiProperty({ description: 'Medicine creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Medicine last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Medicine category' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Medicine dosage form' })
  @Column({ nullable: true })
  dosageForm: string;

  @ApiProperty({ description: 'Medicine strength' })
  @Column({ nullable: true })
  strength: string;

  @ApiProperty({ description: 'Prescription required' })
  @Column({ default: false })
  prescriptionRequired: boolean;

  @ApiProperty({ description: 'Medicine status' })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Stock quantity' })
  @Column({ default: 0 })
  stockQuantity: number;

  @ApiProperty({ description: 'Minimum stock level' })
  @Column({ default: 10 })
  minimumStockLevel: number;

  // Many-to-many relationship: Medicine available in multiple pharmacies
  @ManyToMany(() => Pharmacy, (pharmacy) => pharmacy.medicines)
  @JoinTable({
    name: 'pharmacy_medicines', // join table name
    joinColumn: { name: 'medicineId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pharmacyId', referencedColumnName: 'id' },
  })
  pharmacies: Pharmacy[];
}
