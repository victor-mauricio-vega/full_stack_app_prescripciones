import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Roles(Role.doctor, Role.admin)
@Controller('patients')
export class PatientsController {
  constructor(private service: PatientsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(Number(page ?? 1), Number(limit ?? 50));
  }
}
