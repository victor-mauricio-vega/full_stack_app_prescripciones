import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PayloadToken } from '../model/payload.model';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadToken) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      throw new HttpException(
        { message: 'No autorizado' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return { ...payload, refreshToken };
  }
}
