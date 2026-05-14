import { IsString } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';

export class CreateDoctorDto extends RegisterDto {
  @IsString()
  specialty!: string;
}
