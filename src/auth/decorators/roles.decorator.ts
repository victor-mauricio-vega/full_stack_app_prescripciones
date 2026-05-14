import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

export const ROLES = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
