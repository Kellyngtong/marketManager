import { Express, Router } from 'express';
import * as carritoController from '@controllers/carrito.controller';
import * as authJwt from '@middlewares/authJwt';
import { extractTenant } from '@middlewares/tenant';

export default (app: Express): void => {
  const router = Router();

  /**
   * GET /api/carrito
   * Obtener todos los items del carrito del usuario
   */
  router.get('/', authJwt.verifyToken, extractTenant, carritoController.getCarrito);

  /**
   * POST /api/carrito
   * Agregar item al carrito
   * Body: { idarticulo, cantidad }
   */
  router.post('/', authJwt.verifyToken, extractTenant, carritoController.addToCarrito);

  /**
   * PUT /api/carrito/:idcarrito_item
   * Actualizar cantidad de un item
   * Body: { cantidad }
   */
  router.put('/:idcarrito_item', authJwt.verifyToken, extractTenant, carritoController.updateCarritoItem);

  /**
   * DELETE /api/carrito/:idcarrito_item
   * Eliminar un item del carrito
   */
  router.delete('/:idcarrito_item', authJwt.verifyToken, extractTenant, carritoController.removeFromCarrito);

  /**
   * DELETE /api/carrito
   * Vaciar carrito completo
   */
  router.delete('/', authJwt.verifyToken, extractTenant, carritoController.clearCarrito);

  app.use('/api/carrito', router);
};
