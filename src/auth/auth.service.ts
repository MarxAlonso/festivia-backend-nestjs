import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { User, UserStatus } from '../database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * AuthService
 *
 * - Responsable de la lógica de autenticación: validar credenciales, registrar usuarios,
 *   generar y verificar tokens JWT, renovar tokens de refresh.
 * - Se apoya en el repositorio de User para operaciones de persistencia y en JwtService
 *   para firmar/verificar tokens.
 *
 * Flujo típico:
 * - login: recibe una entidad User (ya validada), crea el payload y devuelve access + refresh token.
 * - register: crea un usuario (hashea la contraseña) y devuelve los tokens mediante login().
 * - refreshToken: verifica el refresh token y, si es válido y el usuario está activo, devuelve nuevos tokens.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * validateUser
   *
   * - Valida credenciales contra la base de datos.
   * - Compara la contraseña en texto plano con el hash almacenado usando bcrypt.
   * - Retorna la entidad User si las credenciales son correctas, o null si no lo son.
   *
   * Uso:
   * - Esta función suele ser invocada por LocalStrategy al hacer login.
   *
   * @param email Email proporcionado por el usuario
   * @param password Contraseña en texto plano proporcionada por el usuario
   * @returns Promise<User | null> Usuario si es válido, o null en caso contrario
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await compare(password, user.password)) {
      return user;
    }
    
    return null;
  }

  /**
   * login
   *
   * - Genera los tokens (access_token y refresh_token) para un usuario ya autenticado.
   * - Construye un payload con información mínima (sub, email, role) que se incluye en el JWT.
   * - Retorna un objeto con los tokens y datos públicos del usuario.
   *
   * Nota:
   * - No se debe incluir información sensible (como password) en el payload ni en la respuesta.
   *
   * @param user Entidad User ya validada
   * @returns Objeto con access_token, refresh_token y datos del usuario
   */
  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.generateRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * register
   *
   * - Registra un nuevo usuario:
   *   1) Verifica que no exista otro usuario con el mismo email.
   *   2) Hashea la contraseña usando bcrypt.
   *   3) Persiste la entidad User en la base de datos.
   *   4) Devuelve el resultado de login() para proporcionar tokens inmediatamente.
   *
   * @param email Email del nuevo usuario
   * @param password Contraseña en texto plano
   * @param firstName Nombre
   * @param lastName Apellido
   * @param phone Teléfono (opcional)
   * @returns Tokens y datos del usuario (misma estructura que login)
   * @throws UnauthorizedException si el email ya existe
   */
  async register(email: string, password: string, firstName: string, lastName: string, phone?: string, role?: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      status: UserStatus.ACTIVE,
      role: role as any, // Use the provided role or default from entity
    });

    const savedUser = await this.userRepository.save(user);
    
    // Return login response
    return this.login(savedUser);
  }

  /**
   * refreshToken
   *
   * - Verifica y valida el refresh token.
   * - Si es válido y el usuario existe y está activo, genera nuevos tokens mediante login().
   * - Si la verificación falla o el usuario no está activo, lanza UnauthorizedException.
   *
   * Consideraciones de seguridad:
   * - En una implementación más segura se debe almacenar (y comparar) el hash del refresh token
   *   en la base de datos para poder invalidarlo en logout o rotación de tokens.
   *
   * @param refreshToken Token de refresh proporcionado por el cliente
   * @returns Nuevos access + refresh tokens (misma estructura que login)
   * @throws UnauthorizedException si el token es inválido o el usuario no es válido/activo
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * validateToken
   *
   * - Método utilitario para verificar cualquier token JWT.
   * - Devuelve el payload decodificado si el token es válido.
   * - Lanza UnauthorizedException si el token no es válido.
   *
   * @param token JWT a verificar
   * @returns Promise<JwtPayload> payload decodificado
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * generateRefreshToken
   *
   * - Firma un JWT usado como refresh token con una expiración mayor (hardcoded aquí como '7d').
   * - Recomendación: usar un secreto distinto para refresh tokens (JWT_REFRESH_SECRET)
   *   y configurar expiración mediante variables de entorno.
   *
   * @param payload Payload a incluir en el refresh token
   * @returns Token firmado (string)
   */
  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
