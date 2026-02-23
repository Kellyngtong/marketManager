import { Express, Router } from "express";
import * as pagosController from "@controllers/pagos.controller";
import * as authJwt from "@middlewares/authJwt";
import { extractTenant } from "@middlewares/tenant";

export default (app: Express): void => {
  const router = Router();

  /**
   * POST /api/pagos/crear-sesion
   * Crear sesión de Stripe Checkout
   */
  router.post(
    "/crear-sesion",
    authJwt.verifyToken,
    extractTenant,
    pagosController.crearSesionCheckout,
  );

  /**
   * POST /api/pagos/crear-sesion-premium
   * Crear sesión de Stripe para hacerse cliente premium
   */
  router.post(
    "/crear-sesion-premium",
    authJwt.verifyToken,
    extractTenant,
    pagosController.crearSesionPremiumCheckout,
  );

  /**
   * GET /api/pagos/sesion/:sessionId
   * Obtener información de la sesión
   */
  router.get(
    "/sesion/:sessionId",
    authJwt.verifyToken,
    extractTenant,
    pagosController.obtenerSesion,
  );

  /**
   * GET /api/pagos/confirmar-pago
   * Confirmar pago y crear venta (sin webhook)
   */
  router.get(
    "/confirmar-pago",
    authJwt.verifyToken,
    extractTenant,
    pagosController.confirmarPago,
  );

  /**
   * POST /api/pagos/webhook
   * Webhook de Stripe (sin autenticación)
   */
  router.post("/webhook", pagosController.handleWebhook);

  app.use("/api/pagos", router);
};
