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

// Extraer tenant del JWT
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
  } catch (err: any) {
    res.status(401).json({ message: 'Token inválido o expirado', error: err.message });
  }
};

// Validar tenant
export const validateTenant = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant || !req.tenant.id_tenant) {
    res.status(401).json({ message: 'Tenant no autenticado' });
    return;
  }

  if (req.params.id_tenant) {
    const id_tenant = Array.isArray(req.params.id_tenant)
      ? parseInt(req.params.id_tenant[0])
      : parseInt(req.params.id_tenant);
    if (id_tenant !== req.tenant.id_tenant) {
      res.status(403).json({ message: 'Acceso denegado: tenant no autorizado' });
      return;
    }
  }

  next();
};

// Requerir admin del tenant
export const requireTenantAdmin = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant) {
    res.status(401).json({ message: 'Tenant no autenticado' });
    return;
  }

  if (req.tenant.idrol !== 4 && req.tenant.idrol !== 3) {
    res.status(403).json({ message: 'Requiere permisos de administrador' });
    return;
  }

  next();
};

// Adjuntar tenant al body
export const attachTenantToBody = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.tenant && req.method !== 'GET') {
    req.body = {
      ...req.body,
      id_tenant: req.tenant.id_tenant,
      id_store: req.tenant.id_store,
    };
  }
  next();
};

// Validar store
export const validateStore = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.params.id_store && req.tenant) {
    const id_store = Array.isArray(req.params.id_store)
      ? parseInt(req.params.id_store[0])
      : parseInt(req.params.id_store);
    req.tenant.id_store = id_store;
  }
  next();
};
