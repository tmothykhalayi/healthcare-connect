import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @ApiProperty({ description: 'Doctor unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'User ID associated with the doctor' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'User associated with this doctor' })
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Patients assigned to this doctor' })
  @OneToMany('Patient', 'assignedDoctor') // Use string reference to avoid circular import
  patients: any[];

  @ApiProperty({ description: 'Doctor specialization' })
  @Column()
  specialization: string;
  
  @ApiProperty({ description: 'Doctor license number' })
  @Column({ unique: true })
  licenseNumber: string;

  @ApiProperty({ description: 'Doctor years of experience' })
  @Column()
  yearsOfExperience: number;

  @ApiProperty({ description: 'Doctor phone number' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ description: 'Doctor office address' })
  @Column({ nullable: true })
  officeAddress: string;
  
  @ApiProperty({ description: 'Doctor creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'Doctor last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
