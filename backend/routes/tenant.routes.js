const express = require("express");
const router = express.Router();
const db = require("../models");
const { extractTenant, requireTenantAdmin } = require("../middlewares/tenant");

const Tenant = db.sequelize.models.tenant || db.sequelize.define("tenant", {});

// =====================================================
// ADMIN: Crear nuevo tenant
// =====================================================
router.post("/admin/tenant", async (req, res) => {
  try {
    const { nombre, email, plan } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ message: "nombre y email son requeridos" });
    }

    const existing = await db.sequelize.query(
      "SELECT * FROM tenant WHERE email = ?",
      { replacements: [email], type: db.sequelize.QueryTypes.SELECT },
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const [result] = await db.sequelize.query(
      "INSERT INTO tenant (nombre, email, plan, estado) VALUES (?, ?, ?, 1)",
      { replacements: [nombre, email, plan || "free"] },
    );

    res.status(201).json({
      message: "Tenant creado exitosamente",
      id_tenant: result,
    });
  } catch (err) {
    console.error("Error al crear tenant:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================================
// ADMIN: Listar tenants
// =====================================================
router.get("/admin/tenants", async (req, res) => {
  try {
    const tenants = await db.sequelize.query(
      "SELECT id_tenant, nombre, email, plan, estado, fecha_creacion FROM tenant ORDER BY fecha_creacion DESC",
      { type: db.sequelize.QueryTypes.SELECT },
    );

    res.json({
      message: "Tenants obtenidos exitosamente",
      count: tenants.length,
      tenants,
    });
  } catch (err) {
    console.error("Error al obtener tenants:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================================
// ADMIN: Editar tenant
// =====================================================
router.put("/admin/tenant/:id_tenant", async (req, res) => {
  try {
    const { id_tenant } = req.params;
    const { nombre, email, plan, estado } = req.body;

    const updateFields = [];
    const values = [];

    if (nombre) {
      updateFields.push("nombre = ?");
      values.push(nombre);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (plan) {
      updateFields.push("plan = ?");
      values.push(plan);
    }
    if (estado !== undefined) {
      updateFields.push("estado = ?");
      values.push(estado);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id_tenant);
    const query = `UPDATE tenant SET ${updateFields.join(", ")} WHERE id_tenant = ?`;

    await db.sequelize.query(query, { replacements: values });

    res.json({ message: "Tenant actualizado exitosamente" });
  } catch (err) {
    console.error("Error al actualizar tenant:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================================
// TENANT: Crear nueva store
// =====================================================
router.post("/tenant/store", extractTenant, async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;
    const id_tenant = req.tenant.id_tenant;

    if (!nombre) {
      return res.status(400).json({ message: "nombre es requerido" });
    }

    const [storeId] = await db.sequelize.query(
      "INSERT INTO store (id_tenant, nombre, direccion, telefono, email, estado) VALUES (?, ?, ?, ?, ?, 1)",
      {
        replacements: [
          id_tenant,
          nombre,
          direccion || null,
          telefono || null,
          email || null,
        ],
      },
    );

    res.status(201).json({
      message: "Store creada exitosamente",
      id_store: storeId,
    });
  } catch (err) {
    console.error("Error al crear store:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================================
// TENANT: Listar stores del tenant
// =====================================================
router.get("/tenant/stores", extractTenant, async (req, res) => {
  try {
    const id_tenant = req.tenant.id_tenant;

    const stores = await db.sequelize.query(
      "SELECT id_store, id_tenant, nombre, direccion, telefono, email, estado FROM store WHERE id_tenant = ? ORDER BY nombre",
      { replacements: [id_tenant], type: db.sequelize.QueryTypes.SELECT },
    );

    res.json({
      message: "Stores obtenidas exitosamente",
      count: stores.length,
      stores,
    });
  } catch (err) {
    console.error("Error al obtener stores:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================================
// TENANT: Editar store
// =====================================================
router.put("/tenant/store/:id_store", extractTenant, async (req, res) => {
  try {
    const { id_store } = req.params;
    const id_tenant = req.tenant.id_tenant;
    const { nombre, direccion, telefono, email, estado } = req.body;

    // Validar que la store pertenece al tenant
    const store = await db.sequelize.query(
      "SELECT * FROM store WHERE id_store = ? AND id_tenant = ?",
      {
        replacements: [id_store, id_tenant],
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    if (store.length === 0) {
      return res
        .status(403)
        .json({ message: "Store no encontrada o acceso denegado" });
    }

    const updateFields = [];
    const values = [];

    if (nombre) {
      updateFields.push("nombre = ?");
      values.push(nombre);
    }
    if (direccion) {
      updateFields.push("direccion = ?");
      values.push(direccion);
    }
    if (telefono) {
      updateFields.push("telefono = ?");
      values.push(telefono);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (estado !== undefined) {
      updateFields.push("estado = ?");
      values.push(estado);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id_store);
    const query = `UPDATE store SET ${updateFields.join(", ")} WHERE id_store = ?`;

    await db.sequelize.query(query, { replacements: values });

    res.json({ message: "Store actualizada exitosamente" });
  } catch (err) {
    console.error("Error al actualizar store:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = (app) => {
  app.use("/api", router);
};
