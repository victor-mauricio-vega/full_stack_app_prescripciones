import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.patient.count(),
    ]);
    return { data, meta: { total, page, limit } };
  }
}
