import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus, Prisma, Role, User } from '@prisma/client';
import { QueryPrescriptionAdminDto } from './dto/query-prescription-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  async getPrescription(query: QueryPrescriptionAdminDto, user: User) {
    try {
      const {
        status,
        from,
        to,
        page = 1,
        limit = 10,
        order = 'desc',
        patientId,
        doctorId,
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
            author: {
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

  async metric(from?: string, to?: string) {
    try {
      const where = {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      };

      const [doctors, patients, prescriptions, pending, consumed] =
        await Promise.all([
          this.prisma.user.count({
            where: { role: Role.doctor },
          }),
          this.prisma.user.count({
            where: { role: Role.patient },
          }),
          this.prisma.prescription.count({
            where,
          }),
          this.prisma.prescription.count({
            where: {
              ...where,
              status: PrescriptionStatus.pending,
            },
          }),
          this.prisma.prescription.count({
            where: {
              ...where,
              status: PrescriptionStatus.consumed,
            },
          }),
        ]);

      return {
        totals: {
          doctors,
          patients,
          prescriptions,
        },
        byStatus: {
          pending,
          consumed,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error en las metricas ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
