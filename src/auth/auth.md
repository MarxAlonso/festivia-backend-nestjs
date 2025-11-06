# Módulo Auth — Documentación

Resumen
- Propósito: autenticación y autorización (login, refresh token, estrategias JWT/local).
- Ubicación: `src/auth/*`
- Relación con el sistema: integra `UsersService`/entidad `User` y provee tokens JWT usados por guards (`JwtAuthGuard`) y roles (`RolesGuard`).

Estructura y responsabilidades
- auth.module.ts
  - Declara y configura el módulo de autenticación.
  - Registra JwtModule (configuración asíncrona desde `src/config/jwt.config.ts`).
  - Provee `AuthService`, `LocalStrategy` y `JwtStrategy`.
- auth.service.ts
  - Lógica de login, validación de credenciales, generación de access & refresh tokens y renovación.
  - Debe usar `UsersService` para buscar usuarios y bcrypt para comparar contraseñas.
- auth.controller.ts
  - Endpoints públicos: `/auth/login`, `/auth/refresh`, `/auth/register` (si existe).
  - Devuelve tokens y datos de usuario (no incluir password).
- strategies/
  - local.strategy.ts: valida credenciales (username/email + password) para login con `passport-local`.
  - jwt.strategy.ts: valida access token en cada request protegida (passport-jwt).
- dto/
  - login.dto.ts, refresh-token.dto.ts — validaciones de payload para los endpoints.

Variables de entorno importantes
- JWT_SECRET: secreto para firmar access tokens.
- JWT_EXPIRES_IN: expiración de access token (ej. "15m").
- JWT_REFRESH_SECRET: secreto para refresh tokens (recomendado distinto).
- JWT_REFRESH_EXPIRES_IN: expiración refresh token (ej. "7d").

Flujo típico
1. Cliente POST /auth/login con email y password.
2. LocalStrategy valida credenciales — AuthService genera access & refresh tokens.
3. Cliente usa Authorization: Bearer <access_token> en peticiones protegidas.
4. Cuando access_token expira, POST /auth/refresh con refresh token para obtener nuevos tokens.

Pruebas con Postman
- Login:
  - POST http://localhost:3000/auth/login
  - Body JSON: { "email": "user@example.com", "password": "Password123!" }
  - Respuesta: { access_token, refresh_token, user }
- Refresh:
  - POST http://localhost:3000/auth/refresh
  - Body JSON: { "refreshToken": "<REFRESH_TOKEN>" }
  - Respuesta: { access_token, refresh_token }

Buenas prácticas
- Usar refresh token con almacenamiento seguro (httpOnly cookie o storage seguro).
- Almacenar hash del refresh token en DB para poder invalidarlo (logout/rotación).
- No exponer `JWT_REFRESH_SECRET` ni `JWT_SECRET` en repositorio.
- Mantener `synchronize=false` en producción y usar migraciones.

Extensiones/Mejoras recomendadas
- Implementar bloqueo de cuenta tras X intentos fallidos.
- Implementar verificación de email antes de activar cuenta.
- Registrar auditoría (createdAt, lastLogin) en `User`.
