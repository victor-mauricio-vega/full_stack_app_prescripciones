import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionStatus, Prisma, Role, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}
  async createPrescription(dto: CreatePrescriptionDto, user: User) {
    try {
      const { patientId, notes, items } = dto;
      const doctor = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!doctor) {
        throw new HttpException(
          { message: 'Perfil de médico no encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const patient = await this.prisma.user.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new HttpException(
          { message: 'Paciente no encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const code = 'RX-' + randomUUID().split('-')[0].toUpperCase();
      const prescription = await this.prisma.prescription.create({
        data: {
          code,
          notes,
          authorId: doctor.id,
          patientId: patient.id,
          items: { create: items },
        },
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

      return prescription;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al crear prescripción: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPrescription(query: QueryPrescriptionDto, user: User) {
    try {
      const {
        status,
        from,
        to,
        page = 1,
        limit = 10,
        order = 'desc',
        doctorId,
        patientId,
      } = query;

      const where: Prisma.PrescriptionWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      if (user.role === Role.doctor) {
        const doctor = await this.prisma.doctor.findUnique({
          where: { userId: user.id },
        });
        where.authorId = doctor?.id;
      }

      if (user.role === Role.patient) {
        const patient = await this.prisma.patient.findUnique({
          where: { userId: user.id },
        });
        where.patientId = patient?.id;
      }

      // Filtros extra para admin
      if (user.role === Role.admin) {
        if (doctorId) where.authorId = doctorId;
        if (patientId) where.patientId = patientId;
      }

      const [data, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: order },
          include: {
            items: true,
            patient: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const meta = {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { data, meta };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al listar prescripciones: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, user: User) {
    try {
      const where: Prisma.PrescriptionWhereInput = {
        id,
      };

      if (user.role === Role.doctor) {
        const doctor = await this.prisma.doctor.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        where.authorId = doctor?.id;
      }

      if (user.role === Role.patient) {
        const patient = await this.prisma.patient.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        where.patientId = patient?.id;
      }
      const prescription = await this.prisma.prescription.findFirst({
        where,
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

      return prescription;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al obtener prescripción: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async consume(id: string, user: User) {
    try {
      const prescription = await this.prisma.prescription.findFirst({
        where: { id },
        include: { patient: true },
      });

      if (!prescription) {
        throw new HttpException(
          { message: 'Prescripción no encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Verificar que el paciente es el dueño
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (prescription.patientId !== patient?.id) {
        throw new HttpException(
          { message: 'No tienes permiso para modificar esta prescripción' },
          HttpStatus.FORBIDDEN,
        );
      }

      if (prescription.status === PrescriptionStatus.consumed) {
        throw new HttpException(
          { message: 'La prescripción ya fue marcada como consumida' },
          HttpStatus.CONFLICT,
        );
      }

      return this.prisma.prescription.update({
        where: { id },
        data: {
          status: PrescriptionStatus.consumed,
          consumedAt: new Date(),
        },
        include: { items: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al consumir prescripción: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
