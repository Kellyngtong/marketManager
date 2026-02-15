import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '@models/usuario.model';
import { Rol } from '@models/rol.model';
import db from '@db/index';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export interface JWTPayload {
  idusuario: number;
  email: string;
  idrol: number;
  rolNombre: string;
  id_tenant?: number;
  id_store?: number;
}

export interface AuthRequest extends Request {
  idusuario?: number;
  idrol?: number;
  rolNombre?: string;
  tenant?: {
    id_tenant?: number;
    id_store?: number;
  };
}

// Register - Crear nuevo usuario
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      email,
      clave,
      idrol,
      telefono,
      direccion,
      num_documento,
      avatar,
      id_tenant,
      id_store,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !clave) {
      res.status(400).json({
        message: 'nombre, email y clave son requeridos',
      });
      return;
    }

    // Validar que el email no exista
    const existing = await (db.usuario as typeof Usuario).findOne({
      where: { email },
    });
    if (existing) {
      res.status(400).json({
        message: 'El email ya está registrado',
      });
      return;
    }

    // Validar rol (por defecto rol 1 = cliente)
    const rol = idrol || 1;
    const rolExists = await (db.rol as typeof Rol).findByPk(rol);
    if (!rolExists) {
      res.status(400).json({
        message: 'Rol inválido',
      });
      return;
    }

    // Hash de la contraseña
    const hashed = await bcrypt.hash(clave, 10);

    // Crear usuario
    const usuario = await (db.usuario as typeof Usuario).create({
      nombre,
      email,
      clave: hashed,
      idrol: rol,
      telefono: telefono || null,
      direccion: direccion || null,
      num_documento: num_documento || null,
      avatar: avatar || null,
      condicion: 1,
      id_tenant: id_tenant || null,
      id_store: id_store || null,
    });

    // Obtener usuario con rol
    const usuarioWithRol = await (db.usuario as typeof Usuario).findByPk(
      usuario.idusuario,
      {
        include: [
          { model: db.rol, attributes: ['idrol', 'nombre', 'descripcion'] },
        ],
        attributes: { exclude: ['clave'] },
      }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioWithRol,
    });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Login - Autenticación con JWT
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, clave } = req.body;

    if (!email || !clave) {
      res.status(400).json({
        message: 'email y clave son requeridos',
      });
      return;
    }

    // Buscar usuario con su rol
    const usuario = await (db.usuario as typeof Usuario).findOne({
      where: { email },
      include: [{ model: db.rol, attributes: ['idrol', 'nombre'] }],
    });

    if (!usuario) {
      res.status(401).json({
        message: 'Credenciales inválidas',
      });
      return;
    }

    // Verificar contraseña
    const match = await bcrypt.compare(clave, usuario.clave);
    if (!match) {
      res.status(401).json({
        message: 'Credenciales inválidas',
      });
      return;
    }

    // Verificar que el usuario esté activo
    if (!usuario.condicion) {
      res.status(401).json({
        message: 'Usuario desactivado',
      });
      return;
    }

    // Generar JWT
    const jwtPayload: JWTPayload = {
      idusuario: usuario.idusuario,
      email: usuario.email,
      idrol: usuario.idrol,
      rolNombre: ((usuario as any).rol as any)?.nombre || 'Usuario',
      id_tenant: usuario.id_tenant || undefined,
      id_store: usuario.id_store || undefined,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login exitoso',
      accessToken: token,
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        id_tenant: usuario.id_tenant,
        id_store: usuario.id_store,
        rol: ((usuario as any).rol as any)?.nombre || 'Usuario',
        idrol: usuario.idrol,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Get Profile - Obtener perfil del usuario autenticado
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;

    const usuario = await (db.usuario as typeof Usuario).findByPk(idusuario, {
      include: [
        { model: db.rol, attributes: ['idrol', 'nombre', 'descripcion'] },
      ],
      attributes: { exclude: ['clave'] },
    });

    if (!usuario) {
      res.status(404).json({
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.json({
      usuario,
    });
  } catch (err) {
    console.error('Error en getProfile:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Update Profile - Actualizar perfil del usuario
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idusuario = req.idusuario;
    const { nombre, telefono, direccion } = req.body;

    const usuario = await (db.usuario as typeof Usuario).findByPk(idusuario);
    if (!usuario) {
      res.status(404).json({
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Actualizar solo los campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (telefono) usuario.telefono = telefono;
    if (direccion) usuario.direccion = direccion;

    await usuario.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
      },
    });
  } catch (err) {
    console.error('Error en updateProfile:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
