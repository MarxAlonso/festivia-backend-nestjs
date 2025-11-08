/**
 * main.ts
 *
 * - Punto de entrada de la aplicación NestJS.
 * - Aquí se configura comportamiento global (validaciones, CORS), y la documentación Swagger.
 * - Comentarios en cada sección explican qué hace y por qué.
 */

import { NestFactory } from '@nestjs/core'; // Crea la aplicación Nest
import { ValidationPipe } from '@nestjs/common'; // Validador global para DTOs
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Documentación API
import { AppModule } from './app.module'; // Módulo raíz de la app

async function bootstrap() {
  // Crea la aplicación a partir del módulo raíz.
  // NestFactory.create monta todos los módulos, controllers y providers registrados en AppModule.
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (aplica a todas las rutas)
  // - whitelist: elimina propiedades no definidas en los DTOs (evita payloads inesperados).
  // - forbidNonWhitelisted: si llegan propiedades extra, devuelve error (más estricto).
  // - transform: convierte automáticamente tipos (por ejemplo strings a números si DTO lo pide).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilita CORS (permite peticiones desde el frontend)
  // - origin: origen permitido (leer de .env FRONTEND_URL o localhost)
  // - credentials: permite cookies / credenciales (útil si usas cookies httpOnly)
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Swagger configuration: genera documentación automática de la API
  // - DocumentBuilder permite añadir título, descripción, versión y seguridad (Bearer).
  const config = new DocumentBuilder()
    .setTitle('CELEBRIA API')
    .setDescription('Digital event invitation system API')
    .setVersion('1.0')
    .addBearerAuth() // Indica que la API usa autenticación Bearer (JWT)
    .build();

  // Creamos el documento y montamos la UI en /api
  // - SwaggerModule.createDocument: genera el esquema OpenAPI leyendo decorators (@ApiTags, @ApiOperation, DTOs).
  // - SwaggerModule.setup: monta la interfaz web para explorar y probar la API.
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Puerto donde escuchará la app (lee de .env PORT o usa 3000 por defecto)
  const port = process.env.PORT ?? 3001;

  // Inicia el servidor HTTP y espera conexiones
  await app.listen(port);

  // Mensajes informativos para el desarrollador
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
