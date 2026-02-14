import { Express, Router } from 'express';
import * as authController from '@controllers/auth.controller';
import * as authJwt from '@middlewares/authJwt';

export default (app: Express): void => {
  const router = Router();

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   * Body: { nombre, email, clave, idrol?, telefono?, direccion?, num_documento?, id_tenant?, id_store? }
   */
  router.post('/register', authController.register);

  /**
   * POST /api/auth/login
   * Autenticación con JWT
   * Body: { email, clave }
   */
  router.post('/login', authController.login);

  /**
   * GET /api/auth/profile
   * Obtener perfil del usuario autenticado
   */
  router.get('/profile', authJwt.verifyToken, authController.getProfile);

  /**
   * PUT /api/auth/profile
   * Actualizar perfil del usuario autenticado
   * Body: { nombre?, telefono?, direccion? }
   */
  router.put('/profile', authJwt.verifyToken, authController.updateProfile);

  app.use('/api/auth', router);
};
