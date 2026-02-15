module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const pagoController = require("../controllers/stripe.payment.controller");
  const authJwt = require("../middlewares/authJwt");

  /**
   * POST /api/pagos/crear-sesion
   * Crear sesión de Stripe Checkout
   * Requiere: autenticación de usuario
   * Body: { datosEnvio: { direccion, telefono } }
   * Response: { sessionId, publicKey }
   */
  router.post(
    "/crear-sesion",
    authJwt.verifyToken,
    pagoController.crearSesionPago,
  );

  /**
   * GET /api/pagos/sesion/:sessionId
   * Obtener estado de sesión de pago
   * Requiere: autenticación de usuario
   * Response: { id, status, customer_email, metadata }
   */
  router.get(
    "/sesion/:sessionId",
    authJwt.verifyToken,
    pagoController.obtenerEstadoSesion,
  );

  /**
   * POST /api/pagos/cancelar-sesion/:sessionId
   * Cancelar sesión (para UI)
   * Requiere: autenticación de usuario
   */
  router.post(
    "/cancelar-sesion/:sessionId",
    authJwt.verifyToken,
    pagoController.cancelarSesion,
  );

  // NOTA: El webhook se registra directamente en index.js ANTES de los body parsers
  // para que express.raw() funcione correctamente con Stripe

  app.use("/api/pagos", router);
};
