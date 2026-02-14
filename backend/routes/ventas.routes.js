module.exports = (app) => {
  const ventaController = require("../controllers/venta.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  const router = require("express").Router();

  const requireCliente = [authJwt.verifyToken, authJwt.hasRole([1, 2])];

  router.post("/", ...requireCliente, ventaController.checkout);
  router.get("/:id", ...requireCliente, ventaController.getDetalleVenta);

  app.use("/api/ventas", router);

  app.get(
    "/api/mis-compras",
    ...requireCliente,
    ventaController.getHistorialCompras
  );
};
