import { Medical } from '../entities/medical.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMedicalRecordsDto {
  @ApiProperty({ type: [Medical] })
  data: Medical[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
