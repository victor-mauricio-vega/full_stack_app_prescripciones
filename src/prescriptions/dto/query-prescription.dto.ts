// // prescriptions/dto/query-prescription.dto.ts
// import { IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
// import { Transform } from 'class-transformer';

// import { PaginationDto } from '../../common/dto/pagination.dto';

// export class QueryPrescriptionDto extends PaginationDto {
//   @IsOptional()
//   @IsEnum(PrescriptionStatus)
//   status?: PrescriptionStatus;

//   @IsOptional()
//   @IsDateString()
//   from?: string;

//   @IsOptional()
//   @IsDateString()
//   to?: string;

//   @IsOptional()
//   @Transform(({ value }) => value === 'true')
//   @IsBoolean()
//   mine?: boolean;

//   @IsOptional()
//   doctorId?: string;

//   @IsOptional()
//   patientId?: string;
// }
