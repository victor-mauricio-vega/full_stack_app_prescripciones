import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { PdfService } from './pdf/pdf.service';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('prescriptions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionService: PrescriptionsService,
    private readonly pdfService: PdfService,
  ) {}

  @ApiOperation({ summary: 'Crear prescripción (médico)' })
  @ApiResponse({ status: 201, description: 'Prescripción creada' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  @Post()
  @Roles(Role.doctor)
  metric(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionService.createPrescription(dto, user);
  }
  @ApiOperation({ summary: 'Listar prescripciones (médico/admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'consumed'] })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @Get()
  @Roles(Role.doctor)
  getPrescription(
    @Query() query: QueryPrescriptionDto,
    @CurrentUser() user: User,
  ) {
    return this.prescriptionService.getPrescription(query, user);
  }

  @ApiOperation({ summary: 'Mis prescripciones (paciente)' })
  @Get('me')
  @Roles(Role.patient)
  findMine(@Query() query: QueryPrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionService.getPrescription(query, user);
  }

  @ApiOperation({ summary: 'Detalle de prescripción' })
  @ApiResponse({ status: 403, description: 'Sin permiso para este recurso' })
  @Get(':id')
  @Roles(Role.doctor, Role.patient, Role.admin)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.prescriptionService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Marcar como consumida (paciente)' })
  @ApiResponse({ status: 409, description: 'Ya fue consumida' })
  @Put(':id/consume')
  @Roles(Role.patient)
  consume(@Param('id') id: string, @CurrentUser() user: User) {
    return this.prescriptionService.consume(id, user);
  }

  @ApiOperation({ summary: 'Descargar PDF de la prescripción' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  @Get(':id/pdf')
  @Roles(Role.patient, Role.doctor, Role.admin)
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    await this.prescriptionService.findOne(id, user);
    return this.pdfService.generatePrescriptionPdf(id, res);
  }
}
