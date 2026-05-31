import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PredictionModule } from './prediction/prediction.module';
import { ApplicantsModule } from './applicants/applicants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PredictionModule,
    ApplicantsModule,
  ],
})
export class AppModule {}
