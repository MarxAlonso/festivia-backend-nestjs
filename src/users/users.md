# Módulo Users — Documentación

Resumen
- Propósito: gestionar la entidad Usuario (persistencia, validación, lógica y endpoints HTTP).
- Ubicación: `src/users/*`
- Relación con el resto: usa la entidad `User` (`src/database/entities/user.entity.ts`) y se integra con Auth (login/registro) y guardias (JWT, Roles).

Estructura de la carpeta
- users.module.ts
  - Registra el módulo en Nest.
  - Importa `TypeOrmModule.forFeature([User])` para inyectar el repositorio de `User`.
  - Declara `UsersController` y `UsersService` y exporta `UsersService` para reutilizar en otros módulos.

- users.controller.ts
  - Define rutas HTTP relacionadas con usuarios.
  - Responsabilidades típicas:
    - Exponer endpoints REST (GET /users, GET /users/:id, PATCH /users/:id, DELETE /users/:id).
    - Validar permisos con `@UseGuards(JwtAuthGuard, RolesGuard)` y decoradores `@Roles(...)`.
    - Parsear DTOs (request bodies) y delegar la lógica al service.
  - Recomendación: no devolver la contraseña en las respuestas (usar DTOs de respuesta o `class-transformer` `@Exclude()`).

- users.service.ts
  - Contiene la lógica de negocio y acceso a datos.
  - Métodos comunes:
    - findAll(): listar usuarios (posiblemente con paginación/filtrado).
    - findOne(id): obtener usuario por id.
    - findByEmail(email): búsqueda por email (usado por Auth).
    - create(dto): crear usuario (hash de contraseña).
    - update(id, dto): actualizar usuario.
    - remove(id): eliminar usuario.
  - Usa `@InjectRepository(User)` para acceder al repositorio TypeORM.
  - Debe hashear contraseñas (bcrypt) antes de persistir y comparar hashes en login.

- dto/
  - create-user.dto.ts
    - DTO para creación de usuario.
    - Validaciones típicas con `class-validator` (`@IsEmail()`, `@MinLength()`, etc).
  - update-user.dto.ts
    - DTO para actualización (campos opcionales).
  - index.ts
    - Re-exporta los DTOs para importaciones limpias.

- Entidad relacionada (fuera de la carpeta)
  - `src/database/entities/user.entity.ts`
  - Define la estructura de la tabla `users` (id, email único, password, name/phone, roles, timestamps).
  - Puede incluir hooks (`@BeforeInsert`) para hashear password o manejar timestamps.

Endpoints y ejemplos (Postman)
- Requisitos: backend en `http://localhost:3000`, obtener token desde `/auth/login`.
- Listar usuarios (requiere token admin):
  - GET http://localhost:3000/users
  - Headers: Authorization: Bearer <ACCESS_TOKEN_ADMIN>
- Obtener usuario:
  - GET http://localhost:3000/users/:id
  - Headers: Authorization: Bearer <ACCESS_TOKEN>
- Actualizar usuario:
  - PATCH http://localhost:3000/users/:id
  - Body (JSON): { "firstName": "Nuevo", "phone": "+51..." }
  - Headers: Authorization: Bearer <ACCESS_TOKEN>
- Eliminar usuario:
  - DELETE http://localhost:3000/users/:id
  - Headers: Authorization: Bearer <ACCESS_TOKEN_ADMIN>

Buenas prácticas y notas
- Seguridad
  - Nunca devolver password en respuestas.
  - Usar JWT y `RolesGuard` para proteger rutas sensibles.
  - Forzar validaciones de entrada con `ValidationPipe` global.
- Contraseñas
  - Hashear con bcrypt (salt >= 10).
  - Almacenar sólo hash y, si se usan refresh tokens, almacenar su hash en DB para invalidación.
- Desarrollo/DB
  - `synchronize: true` solo en desarrollo; en producción usar migraciones.
- Logs y errores
  - Manejar excepciones con `HttpException` y mensajes claros.
  - Registrar eventos importantes (creación de admin, cambios de rol).
- Tests
  - Crear unit/integration tests para `UsersService` (mock del repositorio).
  - Probar endpoints con Postman o tests e2e (Supertest + Jest).

Sugerencias de documentación en código
- Añadir JSDoc encima de cada método en `users.service.ts` y `users.controller.ts` describiendo:
  - propósito, parámetros, valores retornados y errores posibles.
- Añadir ejemplos de request/response en comentarios para facilitar pruebas.
