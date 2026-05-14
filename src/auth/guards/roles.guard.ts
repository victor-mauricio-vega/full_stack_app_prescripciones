import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES } from '../decorators/roles.decorator';
import { PayloadToken } from '../model/payload.model';
import { Request } from 'express';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES, context.getHandler());
    if (!roles) {
      return true;
    }
    // ['admin', 'doctor', 'patient'];
    const request = context.switchToHttp().getRequest<Request>();
    const usuario = request.user as PayloadToken;
    const isAuth = roles.some((role) => role === usuario.role);
    if (!isAuth) {
      throw new UnauthorizedException('su rol no esta autorizado');
    }
    return isAuth;
  }
}
