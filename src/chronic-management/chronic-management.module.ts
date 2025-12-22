import { Module } from '@nestjs/common';
import { ChronicManagementController } from './chronic-management.controller';
import { ChronicManagementService } from './chronic-management.service';

@Module({
  controllers: [ChronicManagementController],
  providers: [ChronicManagementService],
})
export class ChronicManagementModule {}
