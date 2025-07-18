import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';

@Entity('admins')
export class Admin {
  @ApiProperty({ description: 'Admin unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID (from users table)' })
  @Column({ unique: true })
  userId: number;

  @ApiProperty({ description: 'User associated with this admin' })
  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Admin level (super_admin, admin, moderator)' })
  @Column({ default: 'admin' })
  adminLevel: string;

  @ApiProperty({ description: 'Admin permissions (JSON)' })
  @Column({ type: 'json', nullable: true })
  permissions: any;

  @ApiProperty({ description: 'Admin department' })
  @Column({ nullable: true })
  department: string;

  @ApiProperty({ description: 'Admin phone number' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ description: 'Admin emergency contact' })
  @Column({ nullable: true })
  emergencyContact: string;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'Admin status (active, inactive, suspended)' })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Admin notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Admin creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Admin last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
