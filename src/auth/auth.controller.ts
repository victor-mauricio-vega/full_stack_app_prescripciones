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
import { Public } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.registerAuth(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.loginAuth(loginDto);
  }
}
