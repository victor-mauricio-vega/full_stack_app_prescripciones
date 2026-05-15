import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Response } from 'express';

import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { Prescription, PrescriptionItem } from '@prisma/client';

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

      const frontendUrl = process.env.APP_ORIGIN;
      const qrUrl = `${frontendUrl}/patient/prescriptions/${prescription.id}`;

      const qrBuffer = await this.generateQR(qrUrl);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="prescripcion-${prescription.code}.pdf"`,
      );
      doc.pipe(res);

      this.buildPrescriptionPdf(doc, prescription, qrBuffer);
      doc.end();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al generar PDF ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateQR(text: string): Promise<Buffer> {
    return QRCode.toBuffer(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 10,
    });
  }

  private buildPrescriptionPdf(
    doc: PDFKit.PDFDocument,
    prescription: any,
    qrBuffer: Buffer,
  ) {
    const pageWidth = doc.page.width - 100;

    // HEADER
    doc.fontSize(22).fillColor('#1e3a8a').text('PRESCRIPCIÓN MÉDICA', {
      align: 'center',
    });

    doc.moveDown(2);

    // DATOS GENERALES

    doc.fontSize(12).fillColor('#000000');

    doc.text(`Código: ${prescription.code}`);

    doc.text(
      `Fecha: ${new Date(prescription.createdAt).toLocaleDateString('es-CO')}`,
    );
    doc.moveDown();

    // MEDICO

    doc.fontSize(14).fillColor('#1e40af').text('Médico');

    doc.moveDown(0.5);

    doc.fontSize(11).fillColor('#000000');

    doc.text(`Nombre: ${prescription.author.user.name}`);

    doc.text(`Cargo: ${prescription.author.specialty}`);

    doc.moveDown(1.5);

    // NOTAS

    doc.fontSize(14).fillColor('#1e40af').text('Notas');

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor('#000000')
      .text(prescription.notes || 'Sin notas adicionales.', {
        align: 'justify',
      });

    doc.moveDown(2);

    // MEDICAMENTOS

    doc.fontSize(14).fillColor('#1e40af').text('Medicamentos');

    doc.moveDown();

    prescription.items.forEach(
      (
        item: {
          name: string;
          dosage: string;
          instructions: string;
        },
        index: number,
      ) => {
        doc
          .fontSize(12)
          .fillColor('#111827')
          .text(`${index + 1}. ${item.name}`, {
            underline: true,
          });

        doc.moveDown(0.3);

        doc.fontSize(10).fillColor('#374151');

        doc.text(`Dosis: ${item.dosage}`);

        doc.text(`Instrucciones: ${item.instructions}`);

        doc.moveDown(1);
      },
    );

    //  QR Y FIRMA

    const qrSize = 80;

    // Posición fija cerca del final
    const footerY = doc.page.height - 320;

    const qrX = pageWidth - qrSize;

    doc.image(qrBuffer, qrX, footerY, {
      width: qrSize,
      height: qrSize,
    });

    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .text('Escanea para verificar', qrX, footerY + 85, {
        width: qrSize,
        align: 'center',
      });

    // Línea firma
    doc
      .moveTo(50, footerY + 80)
      .lineTo(250, footerY + 80)
      .strokeColor('#9ca3af')
      .stroke();

    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text('Firma del médico', 50, footerY + 85, {
        width: 200,
        align: 'center',
      });

    //  FOOTER;

    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `Documento generado el ${new Date().toLocaleString('es-CO')}`,
        50,
        doc.page.height - 60,
        {
          width: pageWidth,
          align: 'center',
        },
      );
  }
}
