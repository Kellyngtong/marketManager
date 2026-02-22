import { Express, Router, Request, Response, NextFunction } from "express";
import * as authJwt from "@middlewares/authJwt";
import db, { sequelize } from "@db/index";

export default (app: Express): void => {
  const router = Router();

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
  router.get("/metrics", async (req: Request, res: Response) => {
    try {
      // Total de usuarios
      const totalUsers = await db.users.count();

      // Total de pedidos/ventas
      const totalOrders = await db.venta.count();

      // Total de ingresos
      const revenueData: any = await db.venta.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("total")), "totalRevenue"],
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
      console.error("Error getting dashboard metrics:", error);
      res.status(500).json({ message: "Error obteniendo métricas" });
    }
  });

  /**
   * GET /api/admin/users
   * Obtener listado de usuarios
   */
  router.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await db.usuario.findAll({
        attributes: ["idusuario", "nombre", "email", "idrol", "condicion"],
        where: {
          condicion: true, // Only get active users
        },
        include: [
          {
            model: db.rol,
            attributes: ["nombre"],
            required: false,
          },
        ],
        limit: 100,
      });

      // Mapear respuesta para incluir el nombre del rol
      const usersWithRol = users.map((user: any) => ({
        idusuario: user.idusuario,
        nombre: user.nombre,
        email: user.email,
        idrol: user.idrol,
        rol: user.rol?.nombre || "cliente",
        condicion: user.condicion,
      }));

      res.json(usersWithRol || []);
    } catch (error) {
      console.error("Error getting users:", error);
      res.json([]);
    }
  });

  /**
   * GET /api/admin/products
   * Obtener listado de productos (admin only)
   */
  router.get("/products", async (req: Request, res: Response) => {
    try {
      const products = await db.articulo.findAll({
        attributes: [
          "idarticulo",
          "nombre",
          "idcategoria",
          "precio_venta",
          "stock",
          "oferta",
        ],
        limit: 100,
        raw: true,
      });
      res.json(products || []);
    } catch (error) {
      console.error("Error getting products:", error);
      res.json([]);
    }
  });

  /**
   * GET /api/admin/orders
   * Obtener listado de pedidos (admin only)
   */
  router.get("/orders", async (req: Request, res: Response) => {
    try {
      const orders = await db.venta.findAll({
        attributes: ["idventa", "idusuario", "total", "fecha_hora", "estado"],
        limit: 100,
        raw: true,
      });
      res.json(orders || []);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.json([]);
    }
  });

  /**
   * DELETE /api/admin/users/:id
   * Eliminar usuario
   */
  router.delete("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id as string, 10);
      const usuario = await db.usuario.findByPk(userId);
      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      // Soft delete - solo marcar como inactivo
      usuario.condicion = false;
      await usuario.save();

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error eliminando usuario" });
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
  router.put("/users/:id", async (req: Request, res: Response) => {
    try {
      console.log("🔧 PUT /users/:id called");
      const userId = parseInt(req.params.id as string, 10);
      const { nombre, email, rol } = req.body;

      const usuario = await db.usuario.findByPk(userId);
      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      // Actualizar campos
      if (nombre && typeof nombre === "string") {
        usuario.nombre = nombre;
      }
      if (email && typeof email === "string") {
        usuario.email = email;
      }

      // Mapear nombre del rol a ID
      const rolMap: { [key: string]: number } = {
        cliente: 1,
        premium: 2,
        empleado: 3,
        admin: 4,
      };

      if (rol && typeof rol === "string") {
        const rolId = rolMap[rol.toLowerCase()];
        if (rolId) {
          usuario.idrol = rolId;
        }
      }

      await usuario.save();

      res.json({
        message: "Usuario actualizado exitosamente",
        usuario: {
          idusuario: usuario.idusuario,
          nombre: usuario.nombre,
          email: usuario.email,
          idrol: usuario.idrol,
        },
      });
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      res
        .status(500)
        .json({
          message: "Error actualizando usuario",
          error: error?.message || "Error desconocido",
        });
    }
  });

  /**
   * DELETE /api/admin/products/:id
   * Eliminar producto
   */
  router.delete("/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const result = await db.articulo.destroy({
        where: { idarticulo: productId },
      });
      res.json({ success: result > 0 });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false });
    }
  });

  /**
   * PUT /api/admin/products/:id
   * Actualizar producto
   */
  router.put("/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id as string, 10);
      
      if (!productId || isNaN(productId)) {
        console.log('❌ Invalid product ID:', req.params.id);
        res.status(400).json({ message: 'ID de producto inválido' });
        return;
      }

      console.log('📝 Updating product with ID:', productId);
      
      const product = await db.articulo.findByPk(productId);
      
      if (!product) {
        console.log('❌ Product not found for ID:', productId);
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
      }

      const [updated] = await db.articulo.update(req.body, {
        where: { idarticulo: productId },
      });

      if (updated > 0) {
        console.log('✅ Product updated successfully:', productId);
        const updatedProduct = await db.articulo.findByPk(productId);
        res.json({ success: true, product: updatedProduct });
      } else {
        console.log('⚠️ No changes made to product:', productId);
        res.json({ success: false, message: 'No se realizaron cambios' });
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando producto',
        error: errorMessage
      });
    }
  });

  /**
   * POST /api/admin/products
   * Crear nuevo producto
   */
  router.post("/products", async (req: Request, res: Response) => {
    try {
      const product = await db.articulo.create(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creando producto" });
    }
  });

  /**
   * GET /api/admin/orders/:id
   * Obtener detalles completos de un pedido con cliente, usuario e items
   */
  router.get("/orders/:id", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id as string, 10);
      console.log("📦 Fetching order with ID:", orderId);

      if (!orderId || isNaN(orderId)) {
        console.log("❌ Invalid order ID:", req.params.id);
        res.status(400).json({ message: "ID de pedido inválido" });
        return;
      }

      const order = await db.venta.findOne({
        where: { idventa: orderId },
      });

      if (!order) {
        console.log("❌ Order not found for ID:", orderId);
        res.status(404).json({ message: "Pedido no encontrado" });
        return;
      }

      console.log("✅ Order found:", order.idventa);

      // Obtener cliente
      let cliente = null;
      try {
        cliente = await db.cliente.findByPk(order.idcliente);
        console.log("👤 Cliente loaded:", cliente?.nombre || "Sin cliente");
      } catch (clienteError) {
        console.error("⚠️ Error loading cliente:", clienteError);
      }

      // Obtener detalles de venta
      let detalles: any[] = [];
      try {
        detalles = await db.detalle_venta.findAll({
          where: { idventa: orderId },
        });
        console.log("📋 Detalles loaded:", detalles.length);
      } catch (detallesError) {
        console.error("⚠️ Error loading detalles:", detallesError);
      }

      // Construir respuesta simple
      const response: any = {
        id: order.idventa,
        orderNumber: `ORD-${String(order.idventa).padStart(3, "0")}`,
        date: order.fecha_hora,
        status: order.estado?.toLowerCase() || "pending",
        customer: {
          name: cliente?.nombre || "Cliente",
          email: cliente?.email || "",
          phone: cliente?.telefono || "",
        },
        shippingAddress: {
          street: cliente?.direccion || "",
          city: "",
          postalCode: "",
          country: "España",
        },
        paymentMethod: "No especificado",
        items: [],
        subtotal: Number(order.total) - Number(order.impuesto),
        shipping: 0,
        tax: Number(order.impuesto),
        total: Number(order.total),
        timeline: [
          {
            status: "Pedido realizado",
            date: new Date(order.fecha_hora).toLocaleString("es-ES"),
            completed: true,
          },
          {
            status: "Pedido confirmado",
            date: "",
            completed: (order.estado || "").toUpperCase() !== "PENDIENTE",
          },
          {
            status: "En preparación",
            date: "",
            completed: ["PROCESANDO", "ENVIADO", "ENTREGADO"].includes(
              (order.estado || "").toUpperCase(),
            ),
          },
          {
            status: "Enviado",
            date: "",
            completed: ["ENVIADO", "ENTREGADO"].includes(
              (order.estado || "").toUpperCase(),
            ),
          },
          {
            status: "Entregado",
            date: "",
            completed: (order.estado || "").toUpperCase() === "ENTREGADO",
          },
        ],
      };

      // Cargar artículos con error handling individual
      for (const detalle of detalles) {
        try {
          console.log(`🔍 Loading articulo for detalle ${detalle.idarticulo}`);
          const articulo = await db.articulo.findByPk(detalle.idarticulo);

          if (!articulo) {
            console.warn(
              `⚠️ Articulo not found with ID: ${detalle.idarticulo}`,
            );
            response.items.push({
              id: detalle.idarticulo,
              name: `Artículo #${detalle.idarticulo}`,
              quantity: detalle.cantidad,
              price: parseFloat(String(detalle.precio)),
              discount: parseFloat(String(detalle.descuento)) || 0,
              image: "",
            });
          } else {
            response.items.push({
              id: detalle.idarticulo,
              name: articulo.nombre || "",
              quantity: detalle.cantidad,
              price: parseFloat(String(detalle.precio)),
              discount: parseFloat(String(detalle.descuento)) || 0,
              image: articulo.imagen || "",
            });
          }
        } catch (articuloError) {
          console.error(
            `❌ Error loading articulo ${detalle.idarticulo}:`,
            articuloError,
          );
          response.items.push({
            id: detalle.idarticulo,
            name: `Artículo #${detalle.idarticulo} (error)`,
            quantity: detalle.cantidad,
            price: parseFloat(String(detalle.precio)),
            discount: parseFloat(String(detalle.descuento)) || 0,
            image: "",
          });
        }
      }

      console.log("✅ Response ready with", response.items.length, "items");
      res.json(response);
    } catch (error) {
      console.error("❌ Error getting order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Full error stack:", error);
      res
        .status(500)
        .json({ message: "Error obteniendo pedido", error: errorMessage });
    }
  });

  /**
   * PUT /api/admin/orders/:id
   * Actualizar estado de pedido
   */
  router.put("/orders/:id", async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const [updated] = await db.venta.update(req.body, {
        where: { idventa: orderId },
      });
      res.json({ success: updated > 0 });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ success: false });
    }
  });

  app.use("/api/admin", router);
  console.log("✅ Rutas de admin registradas en /api/admin");
};
