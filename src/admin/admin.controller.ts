import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryPrescriptionAdminDto } from './dto/query-prescription-admin.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('prescriptions')
  @Roles(Role.admin)
  getPrescription(
    @Query() query: QueryPrescriptionAdminDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.getPrescription(query, user);
  }
  @Post('metrics')
  @Roles(Role.admin)
  metric(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.metric(from, to);
  }
}
