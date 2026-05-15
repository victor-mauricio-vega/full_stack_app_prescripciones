import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'correo@correo.com' })
  @IsEmail({}, { message: 'Email no valido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @ApiProperty({ example: 'pass123' })
  @IsString()
  @MinLength(6, { message: 'Minino 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;
}
