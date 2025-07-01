import { Injectable } from '@nestjs/common';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { UpdateMedicalDto } from './dto/update-medical.dto';

@Injectable()
export class MedicalService {
  create(createMedicalDto: CreateMedicalDto) {
    return 'This action adds a new medical';
  }

  findAll() {
    return `This action returns all medical`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medical`;
  }

  update(id: number, updateMedicalDto: UpdateMedicalDto) {
    return `This action updates a #${id} medical`;
  }

  remove(id: number) {
    return `This action removes a #${id} medical`;
  }
}
