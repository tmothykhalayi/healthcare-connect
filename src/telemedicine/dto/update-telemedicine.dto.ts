import { PartialType } from '@nestjs/swagger';
import { CreateTelemedicineDto } from './create-telemedicine.dto';

export class UpdateTelemedicineDto extends PartialType(CreateTelemedicineDto) {}
