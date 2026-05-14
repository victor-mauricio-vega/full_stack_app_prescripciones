import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'correo@correo.com' })
  @IsEmail({}, { message: 'Email no valido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @ApiProperty({ example: 'pass123' })
  @IsString()
  @MinLength(6, { message: 'Minino 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}
