import { PrescriptionPdfData } from '../types/pdf-prescription.type';

export function buildPrescriptionPdf(
  doc: PDFKit.PDFDocument,
  prescription: PrescriptionPdfData,
) {
  doc.fontSize(20).text('PRESCRIPCIÓN MÉDICA');

  doc.moveDown();

  doc.text(`Paciente: ${prescription.patient.user.name}`);

  doc.text(`Doctor: ${prescription.author.user.name}`);

  doc.moveDown();

  prescription.items.forEach((item) => {
    doc.text(`${item.name} - ${item.dosage}`);
  });
}
