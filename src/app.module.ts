import { Module } from '@nestjs/common';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Sin envFilePath: usa process.env y .env en el root en desarrollo.
      // En Vercel, las variables se inyectan desde la configuración del proyecto.
      expandVariables: true,
      // Intenta cargar .env desde el cwd y desde el directorio del backend
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../.env'),
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => databaseConfig(configService),
    }),

    AuthModule,
    UsersModule,
    TemplatesModule,
    EventsModule,
    InvitationsModule,
    RsvpModule,
    PaymentsModule,
    EmailModule,
  ],
})
export class AppModule {}
