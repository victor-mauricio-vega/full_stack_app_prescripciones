import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}
  async createPresciption(id: string, dto: CreatePrescriptionDto) {
    try {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: id },
      });

      if (!doctor) {
        throw new HttpException(
          { message: 'Perfil de médico no encontrado' },
          HttpStatus.FORBIDDEN,
        );
      }

      const patient = await this.prisma.patient.findUnique({
        where: { id: dto.patientId },
      });
      if (!patient)
        throw new HttpException(
          { message: 'Paciente no encontrado' },
          HttpStatus.NOT_FOUND,
        );

      const code = `RX-${uuidv4().slice(0, 8).toUpperCase()}`;

      return this.prisma.prescription.create({
        data: {
          code,
          notes: dto.notes,
          patientId: patient.id, // ← id del perfil Patient
          authorId: doctor.id, // ← id del perfil Doctor (no userId)
          items: { create: dto.items },
        },
        include: {
          items: true,
          patient: { include: { user: true } },
          author: { include: { user: true } },
        },
      });
    } catch (error) {
      throw new HttpException(
        { message: `Internal server error ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll(query: QueryPrescriptionDto, reqUser: any) {
    try {
      const {
        status,
        from,
        to,
        page = 1,
        limit = 10,
        order = 'desc',
        mine,
        doctorId,
        patientId,
      } = query;

      const where: any = {};

      if (status) where.status = status;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      if (requestUser.role === Role.doctor) {
        const doctor = await this.prisma.doctor.findUnique({
          where: { userId: requestUser.id },
        });
        where.authorId = doctor?.id;
      } else if (requestUser.role === Role.patient) {
        const patient = await this.prisma.patient.findUnique({
          where: { userId: requestUser.id },
        });
        where.patientId = patient?.id;
      } else {
        // admin puede filtrar por doctor o paciente
        if (doctorId) where.authorId = doctorId;
        if (patientId) where.patientId = patientId;
      }

      const [data, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          orderBy: { createdAt: order },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            items: true,
            patient: { include: { user: { omit: { password: true } } } },
            author: { include: { user: { omit: { password: true } } } },
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      return paginate(data, total, page, limit);
    } catch (error) {
      throw new HttpException(
        { message: `Internal server error ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} prescription`;
  }

  update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    return `This action updates a #${id} prescription`;
  }

  remove(id: number) {
    return `This action removes a #${id} prescription`;
  }
}
