import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from './entities/pharmacy.entity';
import { Users, UserRole } from '../users/entities/user.entity';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Injectable()
export class PharmacyService {
    constructor(
        @InjectRepository(Pharmacy) private pharmacyRepository: Repository<Pharmacy>,
        @InjectRepository(Users) private usersRepository: Repository<Users>
    ) {}
//create  a pharmacies
    async create(createPharmacyDto: CreatePharmacyDto) {
        const { userId } = createPharmacyDto;

        // Check if the user exists
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Automatically assign role based on pharmacy status
        let role: UserRole;
        if (user.role === UserRole.ADMIN) {
            role = UserRole.ADMIN;
        } else {
            role = UserRole.PHARMACY;
        }

        try {
            // Update the user's role
            await this.usersRepository.update(userId, { role });
            
            const pharmacy = this.pharmacyRepository.create({
                ...createPharmacyDto,
            });
            return await this.pharmacyRepository.save(pharmacy);
        } catch (error) {
            console.error('Error creating pharmacy:', error);
            
            if (error.code === '23505') {
                throw new ConflictException(`Pharmacy with this details already exists`);
            }
            
            throw new InternalServerErrorException(`Failed to create pharmacy: ${error.message}`);
        }
    }

    async createFromUser(user: Users): Promise<Pharmacy> {
        // Check if pharmacy record already exists
        const existingPharmacy = await this.pharmacyRepository.findOne({
            where: { userId: user.id }
        });

        if (existingPharmacy) {
            return existingPharmacy;
        }

        try {
            const pharmacyData = {
                userId: user.id,
                pharmacyName: `${user.firstName} ${user.lastName} Pharmacy`,
                licenseNumber: `PTEMP_${user.id}_${Date.now()}`,
                address: '',
                phoneNumber: '',
                status: 'pending_verification',
            };

            const newPharmacy = this.pharmacyRepository.create(pharmacyData);
            const savedPharmacy = await this.pharmacyRepository.save(newPharmacy);

            const result = await this.pharmacyRepository.findOne({
                where: { id: savedPharmacy.id },
                relations: ['user']
            });
            
            if (!result) {
                throw new NotFoundException(`Failed to retrieve pharmacy after creation`);
            }
            
            return result;

        } catch (error) {
            console.error('Error creating pharmacy from user:', error);
            
            if (error.code === '23505') {
                throw new ConflictException(`Pharmacy profile already exists for user ID ${user.id}`);
            }
            
            throw new InternalServerErrorException(`Failed to create pharmacy profile: ${error.message}`);
        }
    }


    //get all 
    async findAll() {
        return await this.pharmacyRepository.find();
    }

    async findOne(id: number) {
        const pharmacy = await this.pharmacyRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!pharmacy) {
            throw new NotFoundException(`Pharmacy with ID ${id} not found`);
        }

        return pharmacy;
    }

    async update(id: number, updatePharmacyDto: UpdatePharmacyDto) {
        await this.pharmacyRepository.update(id, updatePharmacyDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const pharmacy = await this.findOne(id);
        return this.pharmacyRepository.remove(pharmacy);
    }
}