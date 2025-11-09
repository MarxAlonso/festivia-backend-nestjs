import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { databaseConfig } from './config/database.config';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
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
  controllers: [],
  providers: [],
})
export class AppModule {}
