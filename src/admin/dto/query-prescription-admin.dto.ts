import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '@prisma/client';

export class QueryPrescriptionAdminDto {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  // Solo para admin: filtrar por doctor o paciente
  @IsOptional()
  doctorId?: string;

  @IsOptional()
  patientId?: string;
}
