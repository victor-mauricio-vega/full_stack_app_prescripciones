import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { QueryPrescriptionAdminDto } from './dto/query-prescription-admin.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Todas las prescripciones (admin)' })
  @Get('prescriptions')
  getAllPrescriptions(@Query() query: QueryPrescriptionAdminDto) {
    return this.adminService.getAllPrescriptions(query);
  }

  @ApiOperation({ summary: 'Métricas del sistema' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @Get('metrics')
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getMetrics(from, to);
  }
}
