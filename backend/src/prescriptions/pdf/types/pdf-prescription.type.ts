import { Prisma } from '@prisma/client';

export type PrescriptionPdfData = Prisma.PrescriptionGetPayload<{
  include: {
    items: true;
    patient: {
      include: { user: { select: { name: true; email: true } } };
    };
    author: {
      include: { user: { select: { name: true; email: true } } };
    };
  };
}>;
