import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../database/entities/user.entity';
import { Event } from '../database/entities/event.entity';
import { Template } from '../database/entities/template.entity';
import { Invitation } from '../database/entities/invitation.entity';
import { Guest } from '../database/entities/guest.entity';
import { Rsvp } from '../database/entities/rsvp.entity';
import { Payment } from '../database/entities/payment.entity';
import { ExternalConfirmation } from '../database/entities/external-confirmation.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const envUrl = configService.get<string>('FESTIVIABD_URL');
  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProd = nodeEnv === 'production';

  if (envUrl && envUrl.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL inválido: detectado esquema file:. Parece ser una URL de SQLite/Prisma. Configure su DSN de Neon (postgresql://...) o elimine la variable conflictiva.'
    );
  }

  const databaseUrl = envUrl;

  if (databaseUrl) {
    console.log('FESTIVIABD_URL =>', databaseUrl);
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [User, Event, Template, Invitation, Guest, Rsvp, Payment, ExternalConfirmation],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      synchronize: !isProd,
      logging: nodeEnv === 'development',
      ssl: databaseUrl.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  // Config local
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_NAME', 'celebria'),
    entities: [User, Event, Template, Invitation, Guest, Rsvp, Payment, ExternalConfirmation],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: !isProd,
    logging: nodeEnv === 'development',
    ssl: false,
  };
};
