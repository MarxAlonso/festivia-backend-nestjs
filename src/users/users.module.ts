import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';

/**
 * UsersModule
 *
 * - Agrupa todo lo relacionado con la funcionalidad "users" (usuarios).
 * - En NestJS un módulo organiza controllers y providers (servicios, repositorios, guardias, etc.)
 *
 * Imports:
 * - TypeOrmModule.forFeature([User]) registra el repositorio de la entidad `User`
 *   para que pueda inyectarse con @InjectRepository(User) en los providers de este módulo.
 *
 * Controllers:
 * - UsersController define las rutas HTTP relacionadas con usuarios.
 *   Nest crea una instancia del controller y la usa para recibir peticiones.
 *
 * Providers:
 * - UsersService contiene la lógica de negocio (CRUD, hashing de password, búsquedas).
 *   Se registra como provider para que Nest lo instancie y lo inyecte donde se necesite.
 *
 * Exports:
 * - export [UsersService] permite que otros módulos importen UsersModule y puedan
 *   inyectar UsersService (por ejemplo AuthModule puede necesitar acceder a usuarios).
 *
 * Resumen del flujo:
 * 1. Una petición HTTP llega al UsersController.
 * 2. El controller delega la operación al UsersService.
 * 3. UsersService usa el repositorio de TypeORM (inyectado gracias a TypeOrmModule.forFeature)
 *    para leer/escribir en la tabla `users`.
 */
@Module({
  imports: [
    // Registra la entidad User para que TypeORM provea su Repository en este módulo
    TypeOrmModule.forFeature([User]),
  ],
  // Controllers expuestos por este módulo (rutas HTTP)
  controllers: [UsersController],
  // Providers (servicios) disponibles dentro del módulo
  providers: [UsersService],
  // Exporta providers que otros módulos pueden reutilizar
  exports: [UsersService],
})
export class UsersModule {}
