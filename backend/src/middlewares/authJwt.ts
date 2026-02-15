import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export interface AuthRequest extends Request {
  idusuario?: number;
  email?: string;
  idrol?: number;
  rolNombre?: string;
}

// Verificar token JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token = (req.headers['x-access-token'] as string) || (req.headers['authorization'] as string);

  if (!token) {
    res.status(401).json({ message: 'No se proporcionó token' });
    return;
  }

  // Si viene con "Bearer ", extraer solo el token
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ message: 'Token no válido' });
      return;
    }
    req.idusuario = decoded.idusuario;
    req.idrol = decoded.idrol;
    req.rolNombre = decoded.rolNombre;
    next();
  });
};

// Verificar rol Cliente (1)
export const isCliente = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if (req.idrol !== 1) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Cliente.' });
    return;
  }

  next();
};

// Verificar rol Premium (2)
export const isPremium = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if (req.idrol !== 2) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Premium.' });
    return;
  }

  next();
};

// Verificar rol Empleado (3)
export const isEmpleado = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if (req.idrol !== 3) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Empleado.' });
    return;
  }

  next();
};

// Verificar rol Admin (4)
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if (req.idrol !== 4) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Admin.' });
    return;
  }

  next();
};

// Verificar rol Empleado o superior (3+)
export const isEmpleadoOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if ((req.idrol || 0) < 3) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere permisos de Empleado.' });
    return;
  }

  next();
};

// Verificar rol Premium o superior (2+)
export const isPremiumOrHigher = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.idusuario) {
    res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
    return;
  }

  if ((req.idrol || 0) < 2) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Premium o superior.' });
    return;
  }

  next();
};

// Verificar múltiples roles
export const hasRole = (rolesRequeridos: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.idusuario) {
      res.status(403).json({ message: 'Acceso denegado. Usuario no autenticado.' });
      return;
    }

    if (!rolesRequeridos.includes(req.idrol || 0)) {
      res.status(403).json({
        message: `Acceso denegado. Se requieren uno de estos roles: ${rolesRequeridos.join(', ')}`,
      });
      return;
    }

    next();
  };
};
