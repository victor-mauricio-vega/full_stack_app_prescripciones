import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly Logger = new Logger('PrismaService');
  async onModuleInit() {
    await this.$connect();
    this.Logger.log('DB conectada');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.Logger.log('DB sin conexion');
  }
}
