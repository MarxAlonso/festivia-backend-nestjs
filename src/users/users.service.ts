import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash } from 'bcryptjs';

/**
 * UsersService
 *
 * - Provee la lógica de negocio relacionada con usuarios (CRUD, hashing de password, cambios de rol/estado).
 * - Se encarga de interactuar con la base de datos a través del Repository de TypeORM.
 *
 * Inyección de dependencias:
 * - @InjectRepository(User) inyecta el repositorio configurado por TypeOrmModule.forFeature([User])
 *
 * Consideraciones:
 * - El hashing de contraseñas se hace con bcryptjs (función `hash`).
 * - Las excepciones lanzadas (ConflictException, NotFoundException) se traducen en respuestas HTTP apropiadas.
 */
@Injectable()
export class UsersService {
  constructor(
    // Repositorio de TypeORM para la entidad User. Usado para operaciones CRUD.
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * create
   *
   * - Crea un nuevo usuario en la base de datos.
   * - Verifica si ya existe un usuario con el mismo email (lanza ConflictException).
   * - Hashea la contraseña antes de guardar.
   * - Retorna la entidad User creada.
   *
   * @param createUserDto Datos de creación (validated DTO).
   * @returns Promise<User> Usuario creado.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar existencia previa por email
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // Lanza 409 Conflict si ya existe el email
      throw new ConflictException('User with this email already exists');
    }

    // Hash de la contraseña (salt = 10)
    const hashedPassword = await hash(createUserDto.password, 10);

    // Crear la entidad en memoria (sin persistir todavía)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE, // estado por defecto al crear
    });

    // Persistir en la base de datos y retornar la entidad guardada
    return this.userRepository.save(user);
  }

  /**
   * findAll
   *
   * - Recupera todos los usuarios (sin filtros).
   * - En producción considerar paginación / filtros / proyecciones (excluir password).
   *
   * @returns Promise<User[]> Lista de usuarios.
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * findOne
   *
   * - Obtiene un usuario por su id.
   * - Si no existe, lanza NotFoundException (se traduce a 404).
   *
   * @param id Identificador del usuario (UUID o string).
   * @returns Promise<User> Usuario encontrado.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * findByEmail
   *
   * - Busca un usuario por email. Usado por AuthService para login/validación.
   * - Retorna null si no existe (óptimo para comprobaciones).
   *
   * @param email Email a buscar.
   * @returns Promise<User | null>
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * update
   *
   * - Actualiza los campos de un usuario.
   * - Si se recibe `password`, la hashea antes de persistir.
   * - Usa findOne para asegurarse de que el usuario existe (lanza 404 si no).
   *
   * @param id Id del usuario a actualizar.
   * @param updateUserDto DTO con campos a actualizar (parcial).
   * @returns Promise<User> Usuario actualizado.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    // Merge y guardar los cambios
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * remove
   *
   * - Elimina un usuario de la base de datos.
   * - Primero obtiene la entidad con findOne para validar existencia.
   *
   * @param id Id del usuario a eliminar.
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * updateStatus
   *
   * - Cambia el estado del usuario (por ejemplo ACTIVE / INACTIVE / SUSPENDED).
   * - Útil para bloquear usuarios sin borrarlos.
   *
   * @param id Id del usuario.
   * @param status Nuevo estado (UserStatus enum).
   * @returns Promise<User> Usuario con estado actualizado.
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    return this.userRepository.save(user);
  }

  /**
   * updateRole
   *
   * - Cambia el rol de un usuario (por ejemplo user / admin).
   * - Usado para gestión de permisos desde panel de administración.
   *
   * @param id Id del usuario.
   * @param role Nuevo rol (UserRole enum).
   * @returns Promise<User> Usuario con rol actualizado.
   */
  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.userRepository.save(user);
  }
}
