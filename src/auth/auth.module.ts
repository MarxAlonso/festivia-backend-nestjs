import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy, JwtStrategy } from './strategies';
import { User } from '../database/entities/user.entity';
import { jwtConfig } from '../config';

/**
 * AuthModule
 *
 * - Encapsula la funcionalidad de autenticación (login, refresh, validación JWT).
 * - Importa TypeOrmModule.forFeature([User]) para permitir que AuthService/strategies
 *   consulten la entidad User a través del repositorio inyectado.
 *
 * JwtModule.registerAsync:
 * - Configuración asíncrona para leer secretos/tiempos desde ConfigService (.env).
 * - jwtConfig (función en src/config/jwt.config.ts) provee el objeto con `secret` y `signOptions`.
 * - Esto permite centralizar la configuración JWT y no hardcodear secretos.
 *
 * Providers:
 * - AuthService: lógica central (validar credenciales, generar tokens).
 * - LocalStrategy: estrategia passport-local usada en /auth/login.
 * - JwtStrategy: estrategia passport-jwt que valida access tokens en requests protegidas.
 *
 * Controllers:
 * - AuthController: expone rutas públicas (login, refresh, register si está).
 *
 * Exports:
 * - Exportar AuthService permite que otros módulos (ej. controllers externos o tests)
 *   usen la lógica de auth.
 */
@Module({
  imports: [
    // Permite inyectar repositorio de User en este módulo
    TypeOrmModule.forFeature([User]),
    // Passport integra estrategias (local, jwt)
    PassportModule,
    // JwtModule configurado de forma asíncrona para leer valores desde ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // asegurar que ConfigService esté disponible
      useFactory: jwtConfig, // función que retorna la configuración del JWT
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
