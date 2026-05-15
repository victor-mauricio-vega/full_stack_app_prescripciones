import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive({ message: 'Debe ser un numero positivo' })
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsPositive({ message: 'Debe ser un numero positivo' })
  @Type(() => Number)
  limit: number = 2;
}
