import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

/**
 * UsersController
 *
 * Responsabilidad:
 * - Exponer endpoints HTTP relacionados con la gestión de usuarios.
 * - Aplicar autenticación (JWT) y autorización (Roles) donde corresponda.
 *
 * Decoradores de clase:
 * - @ApiTags('users'): documenta el grupo en Swagger.
 * - @ApiBearerAuth(): indica que usa autorización Bearer (JWT) en Swagger.
 * - @UseGuards(JwtAuthGuard): todas las rutas requieren token válido (puedes sobreescribir por ruta).
 *
 * Flujo general:
 * 1. Request entra a una ruta controlada por este controller.
 * 2. Guards (JwtAuthGuard y RolesGuard) validan autenticación y permisos.
 * 3. El controller delega la lógica al UsersService.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   *
   * - Crea un nuevo usuario.
   * - Requiere rol ADMIN (RolesGuard + @Roles(UserRole.ADMIN)).
   * - Valida el body con CreateUserDto (ValidationPipe global debe estar activo).
   *
   * Request body: CreateUserDto
   * Respuesta: usuario creado (sin password si el service lo omite).
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users
   *
   * - Devuelve la lista de usuarios.
   * - Requiere rol ADMIN.
   * - El service puede devolver paginación/filtrado; aquí se delega al service.
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/profile
   *
   * - Devuelve el perfil del usuario autenticado.
   * - Usa el objeto req.user proporcionado por JwtAuthGuard (payload del token).
   * - Ejemplo: req.user.userId contiene el id del usuario (dependiendo de tu estrategia JWT).
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  /**
   * GET /users/:id
   *
   * - Devuelve un usuario por su id.
   * - Requiere rol ADMIN.
   * - Maneja 404 si no existe (UsersService debe lanzar NotFoundException).
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   *
   * - Actualiza datos de un usuario.
   * - Requiere rol ADMIN (puedes cambiar para permitir que el propio usuario actualice su perfil).
   * - Valida cuerpo con UpdateUserDto.
   * - Devuelve el usuario actualizado.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   *
   * - Elimina un usuario por id.
   * - Requiere rol ADMIN.
   * - El UsersService debe encargarse de lanzar excepciones si no existe.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
