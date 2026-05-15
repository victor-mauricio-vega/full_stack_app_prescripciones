import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role, User } from '@prisma/client';
import { LoginAuthDto } from './dto/login.dto';
import { PayloadToken } from './model/payload.model';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Roles } from './decorators/roles.decorator';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Retorna accessToken y refreshToken',
  })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Nuevo accessToken' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@CurrentUser() payload: PayloadToken) {
    return this.authService.refresh(payload);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario y su perfil' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.patient, Role.doctor, Role.admin)
  profile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
