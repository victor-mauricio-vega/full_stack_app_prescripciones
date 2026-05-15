import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Response } from 'express';

import PDFDocument from 'pdfkit';

import { buildPrescriptionPdf } from './templates/pdfTemplate';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePrescriptionPdf(prescriptionId: string, res: Response) {
    try {
      const prescription = await this.prisma.prescription.findFirst({
        where: { id: prescriptionId },
        include: {
          items: true,
          patient: {
            include: { user: { select: { name: true, email: true } } },
          },
          author: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      });

      if (!prescription) {
        throw new HttpException(
          { message: 'Prescripción no encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="prescripcion-${prescription.code}.pdf"`,
      );
      doc.pipe(res);

      buildPrescriptionPdf(doc, prescription);
      doc.end();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al generar PDF ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
