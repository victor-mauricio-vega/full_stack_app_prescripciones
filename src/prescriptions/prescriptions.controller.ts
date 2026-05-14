import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

import { QueryPrescriptionDto } from './dto/query-prescription.dto';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  // @Roles(Role.doctor, Role.admin)
  findAll(@Query() query: QueryPrescriptionDto, @CurrentUser() user: any) {
    return this.prescriptionsService.findAll(query, user);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(+id, updatePrescriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(+id);
  }
}
