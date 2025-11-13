import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { Template } from './entities/template.entity';
import { Invitation } from './entities/invitation.entity';
import { Guest } from './entities/guest.entity';
import { Rsvp } from './entities/rsvp.entity';
import { Payment } from './entities/payment.entity';

// Asegura que .env se cargue tanto si se ejecuta desde la raíz como desde el backend
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
];

// Si DATABASE_URL viene de entorno global con valor inválido, avisa claramente
const envUrl = process.env.DATABASE_URL;
if (envUrl && envUrl.startsWith('file:')) {
  throw new Error(
    'DATABASE_URL inválido (file:). Use el DSN de Neon (postgresql://...) para las migraciones.'
  );
}

const databaseUrl = envUrl || '';
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Event, Template, Invitation, Guest, Rsvp, Payment],
  migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
  logging: nodeEnv === 'development',
  ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});