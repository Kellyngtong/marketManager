module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");
  const authJwt = require("../middlewares/authJwt.js");
  var router = require("express").Router();

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario (crear cuenta)
   * Body: { nombre, email, clave, idrol?, telefono?, direccion?, num_documento? }
   */
  router.post("/register", auth.register);

  /**
   * POST /api/auth/login
   * Autenticación con email y clave
   * Body: { email, clave }
   * Response: { accessToken, usuario }
   */
  router.post("/login", auth.login);

  /**
   * GET /api/auth/profile
   * Obtener perfil del usuario autenticado
   * Requires: Token válido
   */
  router.get(
    "/profile",
    authJwt.verifyToken,
    auth.getProfile
  );

  /**
   * PUT /api/auth/profile
   * Actualizar perfil del usuario autenticado
   * Requires: Token válido
   * Body: { nombre?, telefono?, direccion? }
   */
  router.put(
    "/profile",
    authJwt.verifyToken,
    auth.updateProfile
  );

  app.use("/api/auth", router);
};

