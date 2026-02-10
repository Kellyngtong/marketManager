const jwt = require("jsonwebtoken");
const db = require("../models");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// =====================================================
// VERIFICAR TOKEN JWT
// =====================================================
exports.verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No se proporcionó token" });
  }

  // Si viene con "Bearer ", extraer solo el token
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token no válido" });
    }
    req.idusuario = decoded.idusuario;
    req.idrol = decoded.idrol;
    req.rolNombre = decoded.rolNombre;
    next();
  });
};

// =====================================================
// VERIFICAR ROL - Cliente (1)
// =====================================================
exports.isCliente = (req, res, next) => {
  // Primero verificar token
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  // Verificar rol
  if (req.idrol !== 1) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol Cliente." });
  }

  next();
};

// =====================================================
// VERIFICAR ROL - Premium (2)
// =====================================================
exports.isPremium = (req, res, next) => {
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  if (req.idrol !== 2) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol Premium." });
  }

  next();
};

// =====================================================
// VERIFICAR ROL - Empleado (3)
// =====================================================
exports.isEmpleado = (req, res, next) => {
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  if (req.idrol !== 3) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol Empleado." });
  }

  next();
};

// =====================================================
// VERIFICAR ROL - Admin (4)
// =====================================================
exports.isAdmin = (req, res, next) => {
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  if (req.idrol !== 4) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol Admin." });
  }

  next();
};

// =====================================================
// VERIFICAR ROL - Empleado o Superior (3+)
// =====================================================
exports.isEmpleadoOrAdmin = (req, res, next) => {
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  if (req.idrol < 3) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere permisos de Empleado." });
  }

  next();
};

// =====================================================
// VERIFICAR ROL - Premium o Superior (2+)
// =====================================================
exports.isPremiumOrHigher = (req, res, next) => {
  if (!req.idusuario) {
    return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
  }

  if (req.idrol < 2) {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol Premium o superior." });
  }

  next();
};

// =====================================================
// VERIFICAR MÚLTIPLES ROLES
// =====================================================
exports.hasRole = (rolesRequeridos) => {
  return (req, res, next) => {
    if (!req.idusuario) {
      return res.status(403).json({ message: "Acceso denegado. Usuario no autenticado." });
    }

    if (!rolesRequeridos.includes(req.idrol)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requieren uno de estos roles: ${rolesRequeridos.join(", ")}` 
      });
    }

    next();
  };
};
