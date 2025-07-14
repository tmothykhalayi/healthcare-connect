import { PartialType } from '@nestjs/swagger';
import { CreateAvailabilityDto, FrontendAvailabilityType } from './create-availability.dto';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {} 