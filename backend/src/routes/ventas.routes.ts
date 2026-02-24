import { Express, Router, Request, Response } from "express";
import * as authJwt from "@middlewares/authJwt";
import { extractTenant } from "@middlewares/tenant";
import * as ventaController from "@controllers/venta.controller";

export default (app: Express): void => {
  const router = Router();

  const requireCliente = [authJwt.verifyToken, authJwt.hasRole([1, 2])];

  /**
   * POST /api/ventas
   * Crear una nueva venta (checkout)
   */
  router.post(
    "/",
    ...requireCliente,
    extractTenant,
    (req: Request, res: Response) => {
      ventaController.checkout(req, res);
    },
  );

  /**
   * GET /api/ventas/:id
   * Obtener detalle de una venta específica
   */
  router.get(
    "/:id",
    ...requireCliente,
    extractTenant,
    (req: Request, res: Response) => {
      ventaController.getDetalleVenta(req, res);
    },
  );

  app.use("/api/ventas", router);

  /**
   * GET /api/mis-compras
   * Obtener historial de compras del usuario autenticado
   */
  app.get(
    "/api/mis-compras",
    ...requireCliente,
    extractTenant,
    (req: Request, res: Response) => {
      ventaController.getHistorialCompras(req, res);
    },
  );
};
