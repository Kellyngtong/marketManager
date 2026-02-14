module.exports = (app) => {
  const carritoController = require("../controllers/carrito.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  const router = require("express").Router();

  router.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  router.use(authJwt.verifyToken);

  router.post("/", carritoController.addToCart);
  router.get("/", carritoController.getCarrito);
  router.get("/totales", carritoController.calcularTotal);
  router.put("/:itemId", carritoController.updateCarrito);
  router.delete("/:itemId", carritoController.removeFromCart);
  router.delete("/", carritoController.clearCarrito);

  app.use("/api/carrito", router);
};
