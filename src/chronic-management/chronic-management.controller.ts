import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ChronicManagementService } from './chronic-management.service';
import { CreateVitalDto } from './dto/create-vital.dto';
import { CreateMedicationLogDto } from './dto/create-medication-log.dto';
import { CreateLifestyleLogDto } from './dto/create-lifestyle-log.dto';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('chronic-management')
@UseGuards(AtGuard)
export class ChronicManagementController {
  constructor(private readonly chronicManagementService: ChronicManagementService) {}

  @Post('vitals')
  async addVital(@Body() dto: CreateVitalDto, @Request() req) {
    return this.chronicManagementService.addVital(dto, req.user);
  }

  @Get('vitals')
  async getVitals(@Request() req) {
    return this.chronicManagementService.getVitals(req.user);
  }

  @Post('medication-logs')
  async addMedicationLog(@Body() dto: CreateMedicationLogDto, @Request() req) {
    return this.chronicManagementService.addMedicationLog(dto, req.user);
  }

  @Get('medication-logs')
  async getMedicationLogs(@Request() req) {
    return this.chronicManagementService.getMedicationLogs(req.user);
  }

  @Post('lifestyle-logs')
  async addLifestyleLog(@Body() dto: CreateLifestyleLogDto, @Request() req) {
    return this.chronicManagementService.addLifestyleLog(dto, req.user);
  }

  @Get('lifestyle-logs')
  async getLifestyleLogs(@Request() req) {
    return this.chronicManagementService.getLifestyleLogs(req.user);
  }
}
