import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { Role } from '../generated/prisma/enums';
import { PayloadToken } from './model/payload.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async registerAuth(dto: RegisterDto) {
    try {
      const { email, password, name } = dto;
      const exists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (exists) {
        throw new HttpException(
          { message: 'El Email ya esta registrado' },
          HttpStatus.CONFLICT,
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const data = {
        email,
        password: hashed,
        name,
        role: Role.patient,
      };
      const user = await this.prisma.user.create({ data });

      const message = `usuario creado exitosamente ${user.name}`;

      return message;
    } catch (error) {
      throw new HttpException(
        { messgae: `errror en en servidor ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginAuth(loginDto: LoginAuthDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { doctor: true, patient: true },
      });

      if (!user) {
        throw new HttpException(
          { message: 'Correo o contraseña son incorrectos' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const checkPass = await bcrypt.compare(password, user.password);

      if (!checkPass) {
        throw new HttpException(
          { message: 'Correo o contraseña son incorrectos' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload: PayloadToken = {
        sub: user.id,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);

      const { password: _, email: __, ...safeUser } = user;

      return { user: safeUser, accessToken };
    } catch (error) {
      throw new HttpException(
        { messgae: `errror en en servidor ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
