import { Request } from 'express';

export interface TenantContext {
  id_tenant: number;
  id_store: number;
  idusuario: number;
  email: string;
  idrol: number;
  rolNombre: string;
}

export interface AuthRequest extends Request {
  tenant?: TenantContext;
  idusuario?: number;
  email?: string;
  idrol?: number;
  rolNombre?: string;
  iat?: number;
  exp?: number;
}

export interface JWTPayload {
  idusuario: number;
  email: string;
  idrol: number;
  rolNombre: string;
  id_tenant: number;
  id_store: number;
  iat?: number;
  exp?: number;
}

export enum RoleEnum {
  CLIENTE = 1,
  PREMIUM = 2,
  EMPLEADO = 3,
  ADMIN = 4,
}

export enum PlanEnum {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}
