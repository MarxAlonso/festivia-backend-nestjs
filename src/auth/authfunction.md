# Módulo Auth — Explicación sencilla

Este archivo explica de forma fácil qué hace `src/auth/auth.controller.ts` y cómo funciona el módulo de autenticación en NestJS.

Resumen rápido
- Propósito: permitir que usuarios se registren, inicien sesión, refresquen tokens y consulten su perfil.
- Ubicación principal: `src/auth/*`
- Conceptos importantes:
  - AuthGuard('local') → valida email+password (login).
  - AuthGuard('jwt') → valida un JWT en las rutas protegidas.
  - AuthService → genera tokens y maneja registro/refresh.
  - DTOs → definen y validan la forma de los datos que llegan en las peticiones.

Qué hace cada ruta (endpoints)
- POST /auth/register
  - Para qué: crear un nuevo usuario.
  - Body (ejemplo):
    {
      "email": "user@example.com",
      "password": "Password123!",
      "firstName": "Juan",
      "lastName": "Perez",
      "phone": "+51123456789"
    }
  - Respuesta: tokens y datos del usuario (access_token, refresh_token, user).
  - Notas: valida que el email no exista; genera y devuelve tokens (login automático).

- POST /auth/login
  - Para qué: iniciar sesión con email y contraseña.
  - Uso: protegido por `AuthGuard('local')` que ejecuta la validación de credenciales.
  - Body (ejemplo):
    { "email": "user@example.com", "password": "Password123!" }
  - Respuesta: { access_token, refresh_token, user }
  - Notas: no incluir password en la respuesta.

- POST /auth/refresh
  - Para qué: obtener un nuevo access token cuando el access_token expiró.
  - Body (ejemplo):
    { "refreshToken": "<REFRESH_TOKEN_AQUI>" }
  - Respuesta: nuevos tokens (access_token y refresh_token).
  - Notas: el refresh token también debe verificarse; idealmente se compara su hash en BD.

- GET /auth/profile
  - Para qué: obtener los datos del usuario autenticado.
  - Uso: protegido por `AuthGuard('jwt')`.
  - Headers:
    Authorization: Bearer <ACCESS_TOKEN>
  - Respuesta: datos del usuario (según lo que ponga la estrategia JWT en req.user).

Cómo funciona internamente (flujo simple)
1. Registro:
   - El controller recibe el DTO de registro y llama a `authService.register`.
   - `authService` crea el usuario (hashea la contraseña) y llama a `login()` para devolver tokens.

2. Login:
   - `AuthGuard('local')` llama a `LocalStrategy` que usa `authService.validateUser`.
   - Si credenciales válidas: `req.user` queda con el usuario y el controller llama `authService.login(req.user)`.

3. Peticiones protegidas:
   - `AuthGuard('jwt')` usa `JwtStrategy` para verificar `Authorization: Bearer <token>`.
   - Si el token es válido, `req.user` contiene el payload y la request sigue.

4. Refresh:
   - Controller recibe refreshToken y llama `authService.refreshToken`.
   - `refreshToken` verifica el token y devuelve nuevos tokens si todo está bien.

DTOs usados (en palabras sencillas)
- CreateUserDto: define los campos que se necesitan para registrar (email, password, nombres).
- LoginDto: define email y password para login.
- RefreshTokenDto: define campo `refreshToken`.

Pruebas con Postman (pasos)
1. POST /auth/register → guardar `access_token` y `refresh_token`.
2. Usar `access_token` en Headers para rutas protegidas:
   - Header: Authorization: Bearer <ACCESS_TOKEN>
3. Cuando el access_token expire, POST /auth/refresh con el `refreshToken` para obtener nuevos tokens.

Errores comunes y cómo resolverlos
- 401 Unauthorized en login:
  - Revise email/password; la contraseña se compara con el hash en BD.
- 401 en rutas protegidas:
  - Verifique que el header Authorization esté correcto y que el token no haya expirado.
- Refresh token inválido:
  - Asegúrese de enviar exactamente el refresh token que recibió; en producción se recomienda almacenar su hash.

Variables importantes en `.env`
- JWT_SECRET: secreto para firmar access tokens.
- JWT_EXPIRES_IN: vida del access token (ej. "15m").
- JWT_REFRESH_SECRET (recomendado): secreto distinto para refresh tokens.
- JWT_REFRESH_EXPIRES_IN: vida del refresh token (ej. "7d").

Buenas prácticas (rápido)
- Nunca exponer secretos en el repositorio.
- No incluir `password` en respuestas.
- Almacenar hash de refresh tokens en BD para poder revocarlos.
- Usar HTTPS en producción.
- Usar `synchronize=false` y migraciones en producción.

Dónde mirar el código relacionado
- auth.service.ts → lógica principal de tokens y registro.
- auth.controller.ts → rutas y cómo se usan los guards.
- src/auth/strategies/local.strategy.ts → validación de email+password.
- src/auth/strategies/jwt.strategy.ts → validación de JWT en cada request.
