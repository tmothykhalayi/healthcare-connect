import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';

@Entity('patients')
export class Patient {
  @ApiProperty({ description: 'Patient unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'User ID associated with the patient' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'User associated with this patient' })
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Orders associated with this patient' })
  @OneToMany('Order', 'patient') // Use string reference to avoid circular import
  orders: any[];

  @ApiProperty({ description: 'Assigned doctor ID' })
  @Column({ nullable: true })
  assignedDoctorId: number;

  @ApiProperty({ description: 'Assigned doctor' })
  @ManyToOne('Doctor', 'patients', { 
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'assignedDoctorId' })
  assignedDoctor: any;

  @ApiProperty({ description: 'Patient gender' })
  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: string;
  
  @ApiProperty({ description: 'Patient phone number' })
  @Column()
  phoneNumber: string;
  
  @ApiProperty({ description: 'Patient address' })
  @Column({ nullable: true })
  address: string;
  
  @ApiProperty({ description: 'Patient date of birth' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;
  
  @ApiProperty({ description: 'Patient medical history' })
  @Column({ type: 'text', nullable: true })
  medicalHistory: string;
  
  @ApiProperty({ description: 'Patient creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'Patient last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
