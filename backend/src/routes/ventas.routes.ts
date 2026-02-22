import { Express, Router, Request, Response, NextFunction } from "express";
import * as authJwt from "@middlewares/authJwt";
import { extractTenant } from "@middlewares/tenant";

// Dynamically import the JavaScript controller
let ventaController: any;

export default (app: Express): void => {
  const router = Router();

  // Lazy load the controller
  if (!ventaController) {
    ventaController = require("../../controllers/venta.controller.js");
  }

  const requireCliente = [authJwt.verifyToken, authJwt.hasRole([1, 2])];

  /**
   * POST /api/ventas
   * Crear una nueva venta (checkout)
   */
  router.post(
    "/",
    ...requireCliente,
    extractTenant,
    (req: Request, res: Response, next: NextFunction) => {
      ventaController.checkout(req, res, next);
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
    (req: Request, res: Response, next: NextFunction) => {
      ventaController.getDetalleVenta(req, res, next);
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
    (req: Request, res: Response, next: NextFunction) => {
      ventaController.getHistorialCompras(req, res, next);
    },
  );
};
