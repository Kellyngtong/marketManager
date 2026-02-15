import { Express, Router } from 'express';
import * as articuloController from '@controllers/articulo.controller';
import * as authJwt from '@middlewares/authJwt';
import { extractTenant, extractTenantOptional } from '@middlewares/tenant';

export default (app: Express): void => {
  const router = Router();

  /**
   * GET /api/articulos
   * Obtener todos los artículos con filtros (PÚBLICO - opcional token para filtro multitenant)
   */
  router.get('/', extractTenantOptional, articuloController.getAllArticulos);

  /**
   * GET /api/articulos/:id
   * Obtener artículo por ID (PÚBLICO - opcional token para filtro multitenant)
   */
  router.get('/:id', extractTenantOptional, articuloController.getArticuloById);

  /**
   * GET /api/articulos/codigo/:codigo
   * Obtener artículo por código
   */
  router.get('/codigo/:codigo', articuloController.getArticuloByCodigo);

  /**
   * POST /api/articulos
   * Crear nuevo artículo (EMPLEADO+)
   */
  router.post(
    '/',
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.createArticulo
  );

  /**
   * PUT /api/articulos/:id
   * Actualizar artículo (EMPLEADO+)
   */
  router.put(
    '/:id',
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.updateArticulo
  );

  /**
   * DELETE /api/articulos/:id
   * Eliminar artículo (EMPLEADO+)
   */
  router.delete(
    '/:id',
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.deleteArticulo
  );

  /**
   * PATCH /api/articulos/:id/stock
   * Actualizar stock (EMPLEADO+)
   */
  router.patch(
    '/:id/stock',
    authJwt.verifyToken,
    authJwt.isEmpleadoOrAdmin,
    articuloController.updateStock
  );

  app.use('/api/articulos', router);
};
