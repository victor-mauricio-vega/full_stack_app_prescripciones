import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus, Prisma } from '@prisma/client';
import { QueryPrescriptionAdminDto } from './dto/query-prescription-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllPrescriptions(query: QueryPrescriptionAdminDto) {
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

      if (status) where.status = status;
      if (doctorId) where.authorId = doctorId;
      if (patientId) where.patientId = patientId;

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
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

  async getMetrics(from?: string, to?: string) {
    try {
      const dateFilter: Prisma.PrescriptionWhereInput = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.gte = new Date(from);
        if (to) dateFilter.createdAt.lte = new Date(to);
      }

      // ── Totales ────────────────────────────────────────────
      const [doctors, patients, prescriptions] = await Promise.all([
        this.prisma.doctor.count(),
        this.prisma.patient.count(),
        this.prisma.prescription.count({
          where: { ...dateFilter },
        }),
      ]);

      // ── Por estado ─────────────────────────────────────────
      const [pending, consumed] = await Promise.all([
        this.prisma.prescription.count({
          where: { status: PrescriptionStatus.pending, ...dateFilter },
        }),
        this.prisma.prescription.count({
          where: { status: PrescriptionStatus.consumed, ...dateFilter },
        }),
      ]);

      // ── Por día (últimos 30 días o rango dado) ─────────────
      const fromDate = from
        ? new Date(from)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const byDayRaw = await this.prisma.$queryRaw<
        {
          date: string;
          count: bigint;
        }[]
      >`
        SELECT
          DATE("createdAt")::text AS date,
          COUNT(*)::bigint        AS count
        FROM "Prescription"
        WHERE
          "createdAt" >= ${fromDate}
          AND "createdAt" <= ${toDate}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") ASC
      `;

      const byDay = byDayRaw.map((r) => ({
        date: r.date,
        count: Number(r.count),
      }));

      // ── Top médicos por volumen ────────────────────────────
      const topDoctorsRaw = await this.prisma.$queryRaw<
        {
          authorId: string;
          doctorName: string;
          count: bigint;
        }[]
      >`
        SELECT
          p."authorId",
          u."name" AS "doctorName",
          COUNT(*)::bigint AS count
        FROM "Prescription" p
        JOIN "Doctor"  d ON d.id = p."authorId"
        JOIN "User"    u ON u.id = d."userId"
        GROUP BY p."authorId", u."name"
        ORDER BY count DESC
        LIMIT 5
      `;

      const topDoctors = topDoctorsRaw.map((r) => ({
        authorId: r.authorId,
        doctorName: r.doctorName,
        count: Number(r.count),
      }));

      return {
        totals: { doctors, patients, prescriptions },
        byStatus: { pending, consumed },
        byDay,
        topDoctors,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al obtener métricas: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
