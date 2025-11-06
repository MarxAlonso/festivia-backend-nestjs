/**
 * jwt.config.ts
 *
 * - Provee funciones que generan la configuración para JwtModule de NestJS.
 * - Estas funciones se usan en JwtModule.registerAsync(...) para leer valores
 *   desde ConfigService (variables de entorno) en tiempo de arranque.
 *
 * Conceptos clave (fácil):
 * - JWT (JSON Web Token): token firmado que contiene un "payload" con datos mínimos
 *   (ej. id de usuario, rol). Se usa para autorizar peticiones.
 * - access token: token de corta duración (ej. 15m - 1d) usado para la mayoría de peticiones.
 * - refresh token: token de mayor duración (ej. 7d) usado sólo para pedir nuevos access tokens.
 * - Usar secretos distintos para access y refresh mejora la seguridad.
 */

import { ConfigService } from '@nestjs/config'; // servicio para leer .env u otras fuentes de config
import { JwtModuleOptions } from '@nestjs/jwt'; // tipo de la configuración esperada por JwtModule

/**
 * jwtConfig
 *
 * - Genera la configuración para los access tokens.
 * - Lee las variables JWT_SECRET y JWT_EXPIRES_IN desde ConfigService (.env).
 * - Si no existen, usa valores por defecto (útil en desarrollo).
 *
 * Uso: se pasa como factory a JwtModule.registerAsync(...) dentro de AuthModule.
 */
export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  // 'secret' es la clave con la que se firman los access tokens.
  // Nunca subir este valor a un repositorio público. En producción debe ser fuerte y guardarse en secretos.
  secret: configService.get('JWT_SECRET', 'your-secret-key'),

  // 'signOptions' contiene opciones para firmar el token, aquí la expiración.
  signOptions: {
    // 'expiresIn' define cuánto tiempo es válido el access token.
    // Puede ser un número (segundos) o una cadena (ej. '15m', '1h', '1d').
    expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
  },
});

/**
 * jwtRefreshConfig
 *
 * - Genera la configuración para los refresh tokens.
 * - Se recomienda usar un secreto distinto (JWT_REFRESH_SECRET) y una expiración mayor.
 * - Aunque aquí devolvemos el mismo tipo JwtModuleOptions, normalmente se usa
 *   para firmar/verify de refresh tokens por separado cuando se necesita.
 */
export const jwtRefreshConfig = (configService: ConfigService): JwtModuleOptions => ({
  // Secreto para firmar refresh tokens. Recomendado distinto al de access tokens.
  secret: configService.get('JWT_REFRESH_SECRET', 'your-refresh-secret'),

  signOptions: {
    // Expiración mayor para refresh tokens (ej. '7d' = 7 días).
    expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
});
