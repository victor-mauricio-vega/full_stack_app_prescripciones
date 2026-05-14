import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login.dto';
import { PayloadToken } from './model/payload.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginAuthDto) {
    try {
      const { email, password } = dto;

      const user = await this.prisma.user.findUnique({
        where: { email },
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
        email: user.email,
      };

      const tokens = await this.generateTokens(payload);

      const { password: _, email: __, ...safeUser } = user;

      return { user: safeUser, ...tokens };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { messgae: `errror en en servidor ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refresh(payload: PayloadToken) {
    try {
      const newPayload: PayloadToken = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return await this.generateTokens(newPayload);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error al refrescar token: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateTokens(payload: PayloadToken) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<number>('JWT_ACCESS_TTL'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<number>('JWT_REFRESH_TTL'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new HttpException(
          { message: 'Usuario no encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: `Error en servidor: ${error}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
