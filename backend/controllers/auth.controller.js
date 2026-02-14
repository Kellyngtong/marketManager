const db = require("../models");
const Usuario = db.usuario;
const Rol = db.rol;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// =====================================================
// REGISTER - Crear nuevo usuario (solo empleado y admin pueden crear otros)
// =====================================================
exports.register = async (req, res) => {
  try {
    const { nombre, email, clave, idrol, telefono, direccion, num_documento, avatar } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !email || !clave) {
      return res.status(400).json({ 
        message: "nombre, email y clave son requeridos" 
      });
    }

    // Validar que el email no exista
    const existing = await Usuario.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ 
        message: "El email ya está registrado" 
      });
    }

    // Validar rol (por defecto rol 1 = cliente)
    const rol = idrol || 1;
    const rolExists = await Rol.findByPk(rol);
    if (!rolExists) {
      return res.status(400).json({ 
        message: "Rol inválido" 
      });
    }

    // Hash de la contraseña
    const hashed = await bcrypt.hash(clave, 10);
    
    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      clave: hashed,
      idrol: rol,
      telefono: telefono || null,
      direccion: direccion || null,
      num_documento: num_documento || null,
      avatar: avatar || null,
      condicion: 1,
    });

    // Obtener rol para devolver en respuesta
    const usuarioWithRol = await Usuario.findByPk(usuario.idusuario, {
      include: [{ model: db.rol, attributes: ["idrol", "nombre", "descripcion"] }],
    });

    // No devolver contraseña
    res.status(201).json({ 
      message: "Usuario creado exitosamente",
      usuario: {
        idusuario: usuarioWithRol.idusuario,
        nombre: usuarioWithRol.nombre,
        email: usuarioWithRol.email,
        avatar: usuarioWithRol.avatar,
        rol: usuarioWithRol.rol,
      },
    });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// LOGIN - Autenticación con JWT
// =====================================================
exports.login = async (req, res) => {
  try {
    const { email, clave } = req.body;
    
    if (!email || !clave) {
      return res.status(400).json({ 
        message: "email y clave son requeridos" 
      });
    }

    // Buscar usuario con su rol
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: db.rol, attributes: ["idrol", "nombre"] }],
    });

    if (!usuario) {
      return res.status(401).json({ 
        message: "Credenciales inválidas" 
      });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(clave, usuario.clave);
    if (!match) {
      return res.status(401).json({ 
        message: "Credenciales inválidas" 
      });
    }

    // Verificar que el usuario esté activo
    if (!usuario.condicion) {
      return res.status(401).json({ 
        message: "Usuario desactivado" 
      });
    }

    // Generar JWT con información del rol + TENANT MULTITENANT
    const token = jwt.sign(
      {
        idusuario: usuario.idusuario,
        email: usuario.email,
        idrol: usuario.idrol,
        rolNombre: usuario.rol.nombre,
        id_tenant: usuario.id_tenant,
        id_store: usuario.id_store,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      accessToken: token,
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        id_tenant: usuario.id_tenant,
        id_store: usuario.id_store,
        rol: {
          idrol: usuario.rol.idrol,
          nombre: usuario.rol.nombre,
        },
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// GET PROFILE - Obtener perfil del usuario autenticado
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const idusuario = req.idusuario;

    const usuario = await Usuario.findByPk(idusuario, {
      include: [{ model: db.rol, attributes: ["idrol", "nombre", "descripcion"] }],
      attributes: { exclude: ["clave"] }, // Excluir contraseña
    });

    if (!usuario) {
      return res.status(404).json({ 
        message: "Usuario no encontrado" 
      });
    }

    res.json({
      usuario,
    });
  } catch (err) {
    console.error("Error en getProfile:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// UPDATE PROFILE - Actualizar perfil del usuario
// =====================================================
exports.updateProfile = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const { nombre, telefono, direccion } = req.body;

    const usuario = await Usuario.findByPk(idusuario);
    if (!usuario) {
      return res.status(404).json({ 
        message: "Usuario no encontrado" 
      });
    }

    // Actualizar solo los campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (telefono) usuario.telefono = telefono;
    if (direccion) usuario.direccion = direccion;

    await usuario.save();

    res.json({
      message: "Perfil actualizado exitosamente",
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
      },
    });
  } catch (err) {
    console.error("Error en updateProfile:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

