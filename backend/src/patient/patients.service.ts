import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getprescriptionsFromPatient(id: string) {
    try {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: id },
        include: {
          items: {
            select: { id: true, name: true, dosage: true, instructions: true },
          },
          author: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          patient: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });

      console.log(prescription?.id);

      if (!prescription) {
        throw new HttpException(
          { message: 'Prescripción no encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        id: prescription.id,
        code: prescription.code,
        notes: prescription.notes,
        createdAt: prescription.createdAt,

        doctor: {
          name: prescription.author.user.name,
          email: prescription.author.user.email,
          position: prescription.author.specialty,
        },

        patient: {
          name: prescription.patient.user.name,
          email: prescription.patient.user.email,
        },

        items: prescription.items,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error en el` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
