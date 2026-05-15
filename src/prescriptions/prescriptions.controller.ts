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

@UseGuards(AuthGuard('jwt'))
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionService: PrescriptionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(Role.doctor)
  metric(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionService.createPrescription(dto, user);
  }

  @Get()
  @Roles(Role.doctor)
  getPrescription(
    @Query() query: QueryPrescriptionDto,
    @CurrentUser() user: User,
  ) {
    return this.prescriptionService.getPrescription(query, user);
  }

  @Get('me')
  @Roles(Role.patient)
  findMine(@Query() query: QueryPrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionService.getPrescription(query, user);
  }
  @Get(':id')
  @Roles(Role.doctor, Role.patient, Role.admin)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.prescriptionService.findOne(id, user);
  }

  @Put(':id/consume')
  @Roles(Role.patient)
  consume(@Param('id') id: string, @CurrentUser() user: User) {
    return this.prescriptionService.consume(id, user);
  }

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
