import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Entidades usadas por TypeORM — representan las tablas de la BD.
// Cada entidad es una clase que mapea columnas y relaciones.
import { User } from '../database/entities/user.entity';
import { Event } from '../database/entities/event.entity';
import { Template } from '../database/entities/template.entity';
import { Invitation } from '../database/entities/invitation.entity';
import { Guest } from '../database/entities/guest.entity';
import { Rsvp } from '../database/entities/rsvp.entity';
import { Payment } from '../database/entities/payment.entity';

/**
 * databaseConfig
 *
 * - Devuelve la configuración que TypeOrmModule necesita para conectarse a PostgreSQL.
 * - Se usa con TypeOrmModule.forRootAsync({ useFactory: databaseConfig, inject: [ConfigService] })
 *
 * Notas sencillas:
 * - ConfigService lee variables de entorno (.env). Aquí se obtienen host, puerto, usuario, etc.
 * - TypeOrmModuleOptions: tipo que define opciones de conexión para TypeORM.
 */
export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  // Tipo de base de datos que usamos (Postgres).
  // TypeORM soporta varios motores (mysql, sqlite, etc.), aquí indicamos 'postgres'.
  type: 'postgres',

  // Host donde está el servidor de Postgres (ej. 'localhost' para local).
  host: configService.get('DB_HOST', 'localhost'),

  // Puerto TCP donde escucha Postgres (por defecto 5432).
  // configService.get devuelve string o number; TypeORM acepta number.
  port: configService.get('DB_PORT', 5432),

  // Usuario de la base de datos (ej. 'postgres' o un user creado).
  username: configService.get('DB_USERNAME', 'postgres'),

  // Contraseña del usuario DB. Asegúrate que coincide con la que usas en psql/pgAdmin.
  password: configService.get('DB_PASSWORD', ''),

  // Nombre de la base de datos (ej. 'celebria').
  database: configService.get('DB_NAME', 'celebria'),

  // Lista de entidades (clases) que TypeORM utilizará para crear/leer tablas.
  // Si una entidad no está aquí, TypeORM no la considerará al sincronizar o generar migraciones.
  entities: [User, Event, Template, Invitation, Guest, Rsvp, Payment],

  // Ruta a los archivos de migraciones (si usas migraciones). TypeORM las aplicará cuando correspond
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

  // synchronize: si es true TypeORM crea/actualiza tablas automáticamente según las entidades.
  // Muy útil en desarrollo, peligroso en producción (puede perder datos).
  synchronize: configService.get('NODE_ENV') !== 'production',

  // logging: si true TypeORM imprimirá consultas SQL en consola (útil para depurar).
  logging: configService.get('NODE_ENV') === 'development',

  // ssl: configuración para conexiones seguras TLS. Puede ser false o un objeto.
  // Aquí se lee DB_SSL (string 'true' para activarlo). rejectUnauthorized: false evita fallos con certificados autofirmados.
  // Breve explicación técnica: SSL/TLS cifra la conexión entre Node y Postgres; necesario cuando la BD está en la nube.
  ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
});
