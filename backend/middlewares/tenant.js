const jwt = require("jsonwebtoken");

/**
 * Middleware para extraer y validar tenant_id del JWT
 * Agrega tenant_id y store_id a req.tenant
 */
exports.extractTenant = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    if (!decoded.id_tenant) {
      return res
        .status(401)
        .json({ message: "Tenant no identificado en el token" });
    }

    // Agregar tenant info a req
    req.tenant = {
      id_tenant: decoded.id_tenant,
      id_store: decoded.id_store || null,
      idusuario: decoded.idusuario,
      email: decoded.email,
      idrol: decoded.idrol,
    };

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token inválido o expirado", error: err.message });
  }
};

/**
 * Middleware para validar que el usuario pertenece al tenant
 * Usa: app.use('/api/protected', validateTenant, routes)
 */
exports.validateTenant = (req, res, next) => {
  if (!req.tenant || !req.tenant.id_tenant) {
    return res.status(401).json({ message: "Tenant no autenticado" });
  }

  // Si hay un tenant_id en los params, validar que coincida
  if (req.params.id_tenant) {
    if (parseInt(req.params.id_tenant) !== req.tenant.id_tenant) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: tenant no autorizado" });
    }
  }

  next();
};

/**
 * Middleware para validar que el usuario es admin del tenant
 */
exports.requireTenantAdmin = (req, res, next) => {
  if (!req.tenant) {
    return res.status(401).json({ message: "Tenant no autenticado" });
  }

  // Rol 4 = Admin, Rol 3 = Empleado (manager)
  if (req.tenant.idrol !== 4 && req.tenant.idrol !== 3) {
    return res
      .status(403)
      .json({ message: "Requiere permisos de administrador" });
  }

  next();
};

/**
 * Middleware para agregar tenant_id automáticamente a requests
 * Útil para filtrado automático en controladores
 */
exports.attachTenantToBody = (req, res, next) => {
  if (req.tenant && req.method !== "GET") {
    req.body = {
      ...req.body,
      id_tenant: req.tenant.id_tenant,
      id_store: req.tenant.id_store,
    };
  }
  next();
};

/**
 * Middleware para validar store_id (optional)
 * Si se proporciona store_id en los params, validar que pertenece al tenant
 */
exports.validateStore = (req, res, next) => {
  if (req.params.id_store && req.tenant) {
    // Aquí se podría validar contra BD que el store pertenece al tenant
    // Por ahora, simplemente permitir si el tenant está autenticado
    req.tenant.id_store = parseInt(req.params.id_store);
  }
  next();
};

module.exports = exports;
