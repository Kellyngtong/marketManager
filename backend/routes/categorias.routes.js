module.exports = (app) => {
  const categoriaController = require("../controllers/categoria.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  const router = require("express").Router();

  /**
   * GET /api/categorias
   * Obtener todas las categorías activas
   * Acceso: Público
   */
  router.get("/", categoriaController.getAllCategorias);

  /**
   * GET /api/categorias/:id
   * Obtener categoría por ID
   * Acceso: Público
   */
  router.get("/:id", categoriaController.getCategoriaById);

  /**
   * GET /api/categorias/:id/articulos
   * Obtener categoría con sus artículos
   * Acceso: Público
   */
  router.get(
    "/:id/articulos",
    categoriaController.getCategoriaWithArticulos
  );

  /**
   * POST /api/categorias
   * Crear nueva categoría
   * Acceso: ADMIN solo
   * Body: { nombre, descripcion? }
   */
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.isAdmin,
    categoriaController.createCategoria
  );

  /**
   * PUT /api/categorias/:id
   * Actualizar categoría
   * Acceso: ADMIN solo
   * Body: { nombre?, descripcion? }
   */
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.isAdmin,
    categoriaController.updateCategoria
  );

  /**
   * DELETE /api/categorias/:id
   * Eliminar (soft delete) categoría
   * Acceso: ADMIN solo
   * Validación: No elimina si tiene artículos asociados
   */
  router.delete(
    "/:id",
    authJwt.verifyToken,
    authJwt.isAdmin,
    categoriaController.deleteCategoria
  );

  app.use("/api/categorias", router);
};
