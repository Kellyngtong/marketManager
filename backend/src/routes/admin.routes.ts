import { Express, Router, Request, Response, NextFunction } from 'express';
import * as authJwt from '@middlewares/authJwt';
import db, { sequelize } from '@db/index';

export default (app: Express): void => {
  const router = Router();
  console.log('🔴 Registrando rutas de admin...');

  // Middleware para verificar admin
  const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    authJwt.verifyToken(req, res, () => {
      authJwt.isAdmin(req, res, next);
    });
  };

  /**
   * GET /api/admin/metrics
   * Obtener métricas del dashboard (admin only)
   */
  router.get('/metrics', async (req: Request, res: Response) => {
    try {
      // Total de usuarios
      const totalUsers = await db.users.count();

      // Total de pedidos/ventas
      const totalOrders = await db.venta.count();

      // Total de ingresos
      const revenueData: any = await db.venta.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
        ],
        raw: true,
      });
      const totalRevenue = parseFloat(revenueData?.totalRevenue || 0);

      // Total de productos/artículos
      const totalProducts = await db.articulo.count();

      res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
      });
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      res.status(500).json({ message: 'Error obteniendo métricas' });
    }
  });

  /**
   * GET /api/admin/users
   * Obtener listado de usuarios
   */
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await db.usuario.findAll({
        attributes: ['idusuario', 'nombre', 'email', 'idrol', 'condicion'],
        where: {
          condicion: true  // Only get active users
        },
        include: [
          {
            model: db.rol,
            attributes: ['nombre'],
            required: false
          }
        ],
        limit: 100,
      });
      
      // Mapear respuesta para incluir el nombre del rol
      const usersWithRol = users.map((user: any) => ({
        idusuario: user.idusuario,
        nombre: user.nombre,
        email: user.email,
        idrol: user.idrol,
        rol: user.rol?.nombre || 'cliente',
        condicion: user.condicion
      }));
      
      res.json(usersWithRol || []);
    } catch (error) {
      console.error('Error getting users:', error);
      res.json([]);
    }
  });

  /**
   * GET /api/admin/products
   * Obtener listado de productos (admin only)
   */
  router.get('/products', async (req: Request, res: Response) => {
    try {
      const products = await db.articulo.findAll({
        attributes: ['idarticulo', 'nombre', 'idcategoria', 'precio_venta', 'stock', 'oferta'],
        limit: 100,
        raw: true,
      });
      res.json(products || []);
    } catch (error) {
      console.error('Error getting products:', error);
      res.json([]);
    }
  });

  /**
   * GET /api/admin/orders
   * Obtener listado de pedidos (admin only)
   */
  router.get('/orders', async (req: Request, res: Response) => {
    try {
      const orders = await db.venta.findAll({
        attributes: [
          'idventa',
          'idusuario',
          'total',
          'fecha_hora',
          'estado',
        ],
        limit: 100,
        raw: true,
      });
      res.json(orders || []);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.json([]);
    }
  });

  /**
   * DELETE /api/admin/users/:id
   * Eliminar usuario
   */
  router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id as string, 10);
      const usuario = await db.usuario.findByPk(userId);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      // Soft delete - solo marcar como inactivo
      usuario.condicion = false;
      await usuario.save();

      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error eliminando usuario' });
    }
  });

  /**
   * PUT /api/admin/users/:id
   * Actualizar usuario
   */
  /**
   * PUT /api/admin/users/:id
   * Actualizar usuario
   */
  router.put('/users/:id', async (req: Request, res: Response) => {
    try {
      console.log('🔧 PUT /users/:id called');
      const userId = parseInt(req.params.id as string, 10);
      const { nombre, email, rol } = req.body;

      const usuario = await db.usuario.findByPk(userId);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      // Actualizar campos
      if (nombre && typeof nombre === 'string') {
        usuario.nombre = nombre;
      }
      if (email && typeof email === 'string') {
        usuario.email = email;
      }
      
      // Mapear nombre del rol a ID
      const rolMap: { [key: string]: number } = {
        'cliente': 1,
        'premium': 2,
        'empleado': 3,
        'admin': 4
      };

      if (rol && typeof rol === 'string') {
        const rolId = rolMap[rol.toLowerCase()];
        if (rolId) {
          usuario.idrol = rolId;
        }
      }

      await usuario.save();

      res.json({
        message: 'Usuario actualizado exitosamente',
        usuario: {
          idusuario: usuario.idusuario,
          nombre: usuario.nombre,
          email: usuario.email,
          idrol: usuario.idrol,
        }
      });
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      res.status(500).json({ message: 'Error actualizando usuario', error: error?.message || 'Error desconocido' });
    }
  });

  /**
   * DELETE /api/admin/products/:id
   * Eliminar producto
   */
  router.delete('/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const result = await db.articulo.destroy({
        where: { idarticulo: productId },
      });
      res.json({ success: result > 0 });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false });
    }
  });

  /**
   * PUT /api/admin/products/:id
   * Actualizar producto
   */
  router.put('/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const [updated] = await db.articulo.update(req.body, {
        where: { idarticulo: productId },
      });
      res.json({ success: updated > 0 });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false });
    }
  });

  /**
   * POST /api/admin/products
   * Crear nuevo producto
   */
  router.post('/products', async (req: Request, res: Response) => {
    try {
      const product = await db.articulo.create(req.body);
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error creando producto' });
    }
  });

  /**
   * GET /api/admin/orders/:id
   * Obtener detalles de un pedido
   */
  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const order = await db.venta.findOne({
        where: { idventa: orderId },
        raw: true,
      });
      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ message: 'Error obteniendo pedido' });
    }
  });

  /**
   * PUT /api/admin/orders/:id
   * Actualizar estado de pedido
   */
  router.put('/orders/:id', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const [updated] = await db.venta.update(req.body, {
        where: { idventa: orderId },
      });
      res.json({ success: updated > 0 });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ success: false });
    }
  });

  app.use('/api/admin', router);
  console.log('✅ Rutas de admin registradas en /api/admin');
};
