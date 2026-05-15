import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { PdfService } from './pdf/pdf.service';

@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PdfService],
  exports: [PrescriptionsService, PdfService],
})
export class PrescriptionsModule {}
