import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Roles(Role.doctor, Role.admin)
@Controller('patient')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @ApiOperation({ summary: 'Visualiza el archivo pdf antes de imprimir' })
  @ApiResponse({
    status: 200,
    description: 'Visualiza los datos el documento antes de imprimir',
  })
  @Roles(Role.patient)
  @Get('prescriptions/:id')
  getprescriptionsFromPatient(@Param('id') id: string) {
    return this.patientsService.getprescriptionsFromPatient(id);
  }
}
