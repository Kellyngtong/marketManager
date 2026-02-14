module.exports = (app) => {
  const articuloController = require("../controllers/articulo.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  const { extractTenant } = require("../middlewares/tenant.js");
  const router = require("express").Router();

  /**
   * GET /api/articulos
   * Obtener todos los artículos con filtros opcionales
   * Query params:
   *   - idcategoria: filtrar por categoría
   *   - search: buscar por nombre, descripción o código
   *   - page: número de página (default 1)
   *   - limit: artículos por página (default 10)
   *   - orderBy: nombre | precio_asc | precio_desc | stock | reciente
   * Acceso: Con autenticación (multitenant)
   */
  router.get("/", extractTenant, articuloController.getAllArticulos);

  /**
   * GET /api/articulos/:id
   * Obtener artículo por ID
   * Acceso: Con autenticación (multitenant)
   */
  router.get("/:id", extractTenant, articuloController.getArticuloById);

  /**
   * GET /api/articulos/codigo/:codigo
   * Obtener artículo por código
   * Acceso: Público
   */
  router.get("/codigo/:codigo", articuloController.getArticuloByCodigo);

  /**
   * POST /api/articulos
   * Crear nuevo artículo
   * Acceso: EMPLEADO o superior
   * Body: { codigo?, nombre, precio_venta, stock?, descripcion?, idcategoria, imagen? }
   */
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.createArticulo,
  );

  /**
   * PUT /api/articulos/:id
   * Actualizar artículo
   * Acceso: EMPLEADO o superior
   * Body: { codigo?, nombre?, precio_venta?, stock?, descripcion?, idcategoria?, imagen? }
   */
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.updateArticulo,
  );

  /**
   * DELETE /api/articulos/:id
   * Eliminar (soft delete) artículo
   * Acceso: EMPLEADO o superior
   * Validación: No elimina si tiene historial de transacciones
   */
  router.delete(
    "/:id",
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.deleteArticulo,
  );

  /**
   * PATCH /api/articulos/:id/stock
   * Actualizar solo el stock (incrementar/decrementar)
   * Acceso: EMPLEADO o superior
   * Body: { cantidad: número positivo o negativo }
   */
  router.patch(
    "/:id/stock",
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.updateStock,
  );

  app.use("/api/articulos", router);
};
