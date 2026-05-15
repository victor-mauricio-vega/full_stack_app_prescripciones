import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { QueryPrescriptionAdminDto } from './dto/query-prescription-admin.dto';

@UseGuards(AuthGuard('jwt'))
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('prescriptions')
  getAllPrescriptions(@Query() query: QueryPrescriptionAdminDto) {
    return this.adminService.getAllPrescriptions(query);
  }
  @Get('metrics')
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getMetrics(from, to);
  }
}
