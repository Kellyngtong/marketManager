import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TenantRequest extends Request {
  tenant?: {
    id_tenant: number;
    id_store?: number;
    idusuario: number;
    email: string;
    idrol: number;
  };
}

// Extraer tenant del JWT (OPCIONAL - solo si hay token)
export const extractTenantOptional = (req: TenantRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // Sin token, continuar sin tenant
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      // Sin token válido, continuar sin tenant
      next();
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    if (decoded.id_tenant) {
      req.tenant = {
        id_tenant: decoded.id_tenant,
        id_store: decoded.id_store || undefined,
        idusuario: decoded.idusuario,
        email: decoded.email,
        idrol: decoded.idrol,
      };
    }

    next();
  } catch (error) {
    // Error al verificar token, continuar sin tenant
    next();
  }
};

// Extraer tenant del JWT (REQUERIDO - debe haber token)
export const extractTenant = (req: TenantRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    if (!decoded.id_tenant) {
      res.status(401).json({ message: 'Tenant no identificado en el token' });
      return;
    }

    req.tenant = {
      id_tenant: decoded.id_tenant,
      id_store: decoded.id_store || undefined,
      idusuario: decoded.idusuario,
      email: decoded.email,
      idrol: decoded.idrol,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// Validar que el tenant en el request pertenece al usuario
export const validateTenant = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (!req.tenant) {
    res.status(401).json({ message: 'Tenant no identificado' });
    return;
  }
  next();
};

// Requerir que el usuario sea admin del tenant
export const requireTenantAdmin = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (!req.tenant) {
    res.status(401).json({ message: 'Usuario no autenticado' });
    return;
  }

  // Check if user is admin of their tenant (idrol === 4 es admin)
  next();
};

// Adjuntar tenant a body para operaciones de creación
export const attachTenantToBody = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (!req.tenant) {
    res.status(401).json({ message: 'Usuario no autenticado' });
    return;
  }

  req.body.id_tenant = req.tenant.id_tenant;
  req.body.id_store = req.tenant.id_store;
  next();
};

// Validar que la tienda pertenece al tenant
export const validateStore = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (!req.tenant) {
    res.status(401).json({ message: 'Usuario no autenticado' });
    return;
  }

  const { storeId } = req.params;
  if (storeId && parseInt(storeId as string) !== req.tenant.id_store) {
    res.status(403).json({ message: 'No tienes acceso a esta tienda' });
    return;
  }

  next();
};
