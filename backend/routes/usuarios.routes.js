module.exports = (app) => {
  const usuarioController = require("../controllers/user.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  const router = require("express").Router();

  router.put(
    "/:id",
    authJwt.verifyToken,
    usuarioController.updateUsuario
  );

  app.use("/api/usuarios", router);
};
