import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

/**
 * RolesGuard
 *
 * - Propósito: verificar si el usuario autenticado tiene alguno de los roles
 *   requeridos por la ruta o el controlador.
 * - Funcionamiento general:
 *   1. Usa Reflector para leer metadatos añadidos por el decorador @Roles(...)
 *      (ese decorador guarda los roles requeridos bajo la clave ROLES_KEY).
 *   2. Si no hay roles requeridos, permite el acceso (true).
 *   3. Si hay roles requeridos, obtiene el usuario desde la request (req.user)
 *      y comprueba si su role coincide con alguno de los roles permitidos.
 *
 * Notas:
 * - Este guard se usa normalmente junto con JwtAuthGuard (primero valida token,
 *   luego RolesGuard valida permisos).
 * - Si quieres soportar múltiples roles por usuario o un array de roles en el user,
 *   adapta la comprobación (p. ej. user.roles.includes(...)).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector permite leer metadatos (decoradores) definidos en handlers/clases.
  constructor(private reflector: Reflector) {}

  /**
   * canActivate
   *
   * - ExecutionContext proporciona acceso a la request/handler/class.
   * - Se llama por Nest antes de ejecutar el handler; debe devolver true para
   *   permitir acceso o false para denegarlo.
   */
  canActivate(context: ExecutionContext): boolean {
    // Leer roles requeridos definidos con @Roles(...) en el handler o en la clase.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // metadata en el método
      context.getClass(), // metadata en la clase (controlador)
    ]);
    
    // Si no existen roles definidos, permitir acceso (no hay restricción por rol).
    if (!requiredRoles) {
      return true;
    }
    
    // Obtener el usuario inyectado por JwtAuthGuard en req.user
    const { user } = context.switchToHttp().getRequest();
    // Si no hay usuario, denegar (por seguridad)
    if (!user) {
      return false;
    }

    // Comprobar si el role del usuario coincide con alguno de los roles requeridos.
    // Devuelve true si existe coincidencia, false en otro caso.
    return requiredRoles.some((role) => user.role === role);
  }
}
