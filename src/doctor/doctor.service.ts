import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const { name, password, email, specialty } = createDoctorDto;

      const doctor = await this.prisma.user.findUnique({
        where: { email },
      });

      if (doctor) {
        throw new HttpException(
          {
            message: `Doctor ${doctor.name} ya se encuetra registrado `,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          name,
          password: hashed,
          email,
          role: Role.doctor,
          doctor: {
            create: { specialty },
          },
        },
        include: { doctor: true },
      });

      const { password: _, ...safeUser } = user;
      return { user: safeUser };
    } catch (error) {
      throw new HttpException(
        { message: `Internal server error ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all doctor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} doctor`;
  }

  update(id: number, updateDoctorDto: UpdateDoctorDto) {
    return `This action updates a #${id}  doctor`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctor`;
  }
}
