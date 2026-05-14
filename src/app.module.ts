import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { DoctorModule } from './doctor/doctor.module';
import { AuthModule } from './auth/auth.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminModule,
    DoctorModule,
    AuthModule,
    PrescriptionsModule,
  ],
})
export class AppModule {}
