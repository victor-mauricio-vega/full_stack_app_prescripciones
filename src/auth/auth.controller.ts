import {
  Controller,
  // Get,
  Post,
  Body,
  // Param,
  // Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { RegisterDto } from './dto/register.dto';
// import { CreateAuthDto } from './dto/login.dto';
// import { UpdateAuthDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.registerAuth(registerDto);
  }
  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.loginAuth(loginDto);
  }
}
