import { Express, Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as authJwt from "@middlewares/authJwt";
import db, { sequelize } from "@db/index";

export default (app: Express): void => {
  const router = Router();
  const requireStaff = [authJwt.verifyToken, authJwt.hasRole([3, 4])];

  const normalizeOrderStatus = (
    value: any,
  ): "NUEVO" | "PENDIENTE" | "ENVIADA" | "CERRADA" => {
    const normalized = String(value || "")
      .trim()
      .toUpperCase();

    if (["NUEVO", "NUEVA", "NEW"].includes(normalized)) {
      return "NUEVO";
    }

    if (["ENVIADO", "ENVIADA", "SENT", "SHIPPED"].includes(normalized)) {
      return "ENVIADA";
    }

    if (
      ["CERRADO", "CERRADA", "ENTREGADA", "ENTREGADO", "CLOSED"].includes(
        normalized,
      )
    ) {
      return "CERRADA";
    }

    if (["PENDIENTE", "PENDIENTE_DE_ENVIO", "PENDING"].includes(normalized)) {
      return "PENDIENTE";
    }

    return "NUEVO";
  };

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
      // Total de usuarios registrados (tabla real del sistema)
      const totalUsers = await db.usuario.count();

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
          "descripcion",
          "imagen",
        ],
        include: [
          {
            model: db.categoria,
            attributes: ['idcategoria', 'nombre'],
            required: false,
          },
        ],
        limit: 100,
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
  router.get(
    "/orders",
    ...requireStaff,
    async (req: Request, res: Response) => {
      try {
        const orders = await db.venta.findAll({
          attributes: [
            "idventa",
            "idusuario",
            "idcliente",
            "total",
            "impuesto",
            "fecha_hora",
            "estado",
            "cliente_nombre",
            "cliente_telefono",
            "cliente_direccion",
          ],
          order: [["idventa", "DESC"]],
          limit: 100,
        });

        const formattedOrders = await Promise.all(
          (orders || []).map(async (order: any) => {
            const [usuario, cliente, detalles] = await Promise.all([
              db.usuario.findByPk(order.idusuario, {
                attributes: [
                  "idusuario",
                  "nombre",
                  "email",
                  "telefono",
                  "direccion",
                ],
              }),
              db.cliente.findByPk(order.idcliente, {
                attributes: [
                  "idcliente",
                  "nombre",
                  "email",
                  "telefono",
                  "direccion",
                ],
              }),
              db.detalle_venta.findAll({
                where: { idventa: order.idventa },
                include: [
                  {
                    model: db.articulo,
                    attributes: ["idarticulo", "nombre", "imagen"],
                  },
                ],
              }),
            ]);

            const items = (detalles || []).map((detalle: any) => ({
              iddetalle_venta: detalle.iddetalle_venta,
              idarticulo: detalle.idarticulo,
              nombre:
                detalle?.articulo?.nombre ||
                detalle?.Articulo?.nombre ||
                `Artículo #${detalle.idarticulo}`,
              cantidad: Number(detalle.cantidad || 0),
              precio: Number(detalle.precio || 0),
              descuento: Number(detalle.descuento || 0),
            }));

            const customerName =
              String(order?.cliente_nombre || "").trim() ||
              cliente?.nombre ||
              usuario?.nombre ||
              "Sin cliente";

            const customerPhone =
              String(order?.cliente_telefono || "").trim() ||
              cliente?.telefono ||
              usuario?.telefono ||
              "Sin teléfono";

            const customerAddress =
              String(order?.cliente_direccion || "").trim() ||
              cliente?.direccion ||
              usuario?.direccion ||
              "Sin dirección";

            return {
              idventa: order.idventa,
              idusuario: order.idusuario,
              idcliente: order.idcliente,
              total: Number(order.total),
              impuesto: Number(order.impuesto || 0),
              fecha_hora: order.fecha_hora,
              estado: normalizeOrderStatus(order.estado),
              usuarioNombre: usuario?.nombre || `Usuario #${order.idusuario}`,
              clienteNombre: customerName,
              clienteDireccion: customerAddress,
              clienteTelefono: customerPhone,
              items,
            };
          }),
        );

        res.json(formattedOrders);
      } catch (error) {
        console.error("Error getting orders:", error);
        res.json([]);
      }
    },
  );

  /**
   * POST /api/admin/orders
   * Crear pedido manualmente desde administración
   */
  router.post(
    "/orders",
    ...requireStaff,
    async (req: Request, res: Response) => {
      try {
        const {
          idcliente,
          idusuario,
          total,
          impuesto,
          estado,
          tipo_comprobante,
          serie_comprobante,
          num_comprobante,
          fecha_hora,
          clienteNombre,
          clienteDireccion,
          clienteTelefono,
        } = req.body || {};

        const parsedTotal = Number(total);
        if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
          res
            .status(400)
            .json({ message: "El total debe ser un número mayor a 0" });
          return;
        }

        const parsedCliente = Number(idcliente);
        if (!Number.isFinite(parsedCliente) || parsedCliente <= 0) {
          res
            .status(400)
            .json({ message: "idcliente es requerido y debe ser válido" });
          return;
        }

        const reqAuth = req as any;
        const parsedUsuario = Number(idusuario || reqAuth.idusuario);
        if (!Number.isFinite(parsedUsuario) || parsedUsuario <= 0) {
          res
            .status(400)
            .json({ message: "idusuario es requerido y debe ser válido" });
          return;
        }

        const normalizedEstado = String(estado || "NUEVO")
          .trim()
          .toUpperCase();
        const normalizedStatus = normalizeOrderStatus(normalizedEstado);

        const clienteExists = await db.cliente.findByPk(parsedCliente);
        const usuarioExists = await db.usuario.findByPk(parsedUsuario);

        if (!clienteExists) {
          res.status(404).json({ message: "Cliente no encontrado" });
          return;
        }

        if (!usuarioExists) {
          res.status(404).json({ message: "Usuario no encontrado" });
          return;
        }

        const createdOrder = await db.venta.create({
          idcliente: parsedCliente,
          idusuario: parsedUsuario,
          tipo_comprobante: String(tipo_comprobante || "FACTURA")
            .trim()
            .toUpperCase(),
          serie_comprobante: String(serie_comprobante || "F001").trim(),
          num_comprobante: String(
            num_comprobante || `AUTO-${Date.now()}`,
          ).trim(),
          fecha_hora: fecha_hora ? new Date(fecha_hora) : new Date(),
          impuesto: Number(impuesto || 0),
          total: parsedTotal,
          estado: normalizedStatus,
          cliente_nombre:
            String(
              clienteNombre ||
                clienteExists.nombre ||
                usuarioExists.nombre ||
                "",
            ).trim() || null,
          cliente_direccion:
            String(
              clienteDireccion ||
                clienteExists.direccion ||
                usuarioExists.direccion ||
                "",
            ).trim() || null,
          cliente_telefono:
            String(
              clienteTelefono ||
                clienteExists.telefono ||
                usuarioExists.telefono ||
                "",
            ).trim() || null,
        });

        res.status(201).json(createdOrder);
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creando pedido" });
      }
    },
  );

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
      console.log("PUT /users/:id called");
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
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Error actualizando usuario",
        error: error?.message || "Error desconocido",
      });
    }
  });

  /**
   * POST /api/admin/users
   * Crear usuario
   */
  router.post("/users", async (req: Request, res: Response) => {
    try {
      const { nombre, email, rol, idrol } = req.body || {};

      if (!nombre || !email) {
        res.status(400).json({ message: "nombre y email son requeridos" });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await db.usuario.findOne({
        where: { email: normalizedEmail },
      });

      const isExistingActive =
        !!existing &&
        (existing.condicion === true || Number(existing.condicion) === 1);
      const isExistingInactive = !!existing && !isExistingActive;

      const rolMap: { [key: string]: number } = {
        cliente: 1,
        premium: 2,
        empleado: 3,
        admin: 4,
      };

      const rolePasswordMap: Record<number, string> = {
        1: "cli123",
        2: "pre123",
        3: "emp123",
        4: "admin123",
      };

      const roleName = String(rol || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

      const roleIdFromName =
        rolMap[roleName] ||
        (roleName.includes("admin")
          ? 4
          : roleName.includes("emplead") || roleName.includes("staff")
            ? 3
            : roleName.includes("premium")
              ? 2
              : roleName.includes("client") || roleName.includes("cliente")
                ? 1
                : undefined);

      const roleId = Number(idrol) || roleIdFromName || 1;

      const roleExists = await db.rol.findByPk(roleId);
      if (!roleExists) {
        res.status(400).json({ message: "Rol inválido" });
        return;
      }

      const presetPassword = rolePasswordMap[roleId] || "cli123";
      const hashedPassword = await bcrypt.hash(presetPassword, 10);

      if (isExistingActive) {
        res.status(400).json({ message: "El email ya está registrado" });
        return;
      }

      if (isExistingInactive) {
        existing.nombre = String(nombre).trim();
        existing.idrol = roleId;
        existing.clave = hashedPassword;
        existing.condicion = true;
        await existing.save();

        res.status(200).json({
          idusuario: existing.idusuario,
          nombre: existing.nombre,
          email: existing.email,
          idrol: existing.idrol,
          rol: (roleExists as any)?.nombre || "cliente",
          condicion: existing.condicion,
          passwordAsignada: presetPassword,
          reactivado: true,
        });
        return;
      }

      const usuario = await db.usuario.create({
        nombre: String(nombre).trim(),
        email: normalizedEmail,
        clave: hashedPassword,
        idrol: roleId,
        condicion: true,
      });

      res.status(201).json({
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        idrol: usuario.idrol,
        rol: (roleExists as any)?.nombre || "cliente",
        condicion: usuario.condicion,
        passwordAsignada: presetPassword,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({
        message: "Error creando usuario",
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
        console.log("Invalid product ID:", req.params.id);
        res.status(400).json({ message: "ID de producto inválido" });
        return;
      }

      console.log("Updating product with ID:", productId);

      const product = await db.articulo.findByPk(productId);

      if (!product) {
        console.log("Product not found for ID:", productId);
        res.status(404).json({ message: "Producto no encontrado" });
        return;
      }

      const [updated] = await db.articulo.update(req.body, {
        where: { idarticulo: productId },
      });

      if (updated > 0) {
        console.log("Product updated successfully:", productId);
        const updatedProduct = await db.articulo.findByPk(productId, {
          include: [
            {
              model: db.categoria,
              attributes: ['idcategoria', 'nombre'],
              required: false,
            },
          ],
        });
        res.json({ success: true, product: updatedProduct });
      } else {
        console.log("No changes made to product:", productId);
        res.json({ success: false, message: "No se realizaron cambios" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        message: "Error actualizando producto",
        error: errorMessage,
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
      
      // Obtener el producto con la categoría incluida
      const productWithCategory = await db.articulo.findByPk(product.idarticulo, {
        include: [
          {
            model: db.categoria,
            attributes: ['idcategoria', 'nombre'],
            required: false,
          },
        ],
      });
      
      res.json(productWithCategory);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creando producto" });
    }
  });

  /**
   * GET /api/admin/orders/:id
   * Obtener detalles completos de un pedido con cliente, usuario e items
   */
  router.get(
    "/orders/:id",
    ...requireStaff,
    async (req: Request, res: Response) => {
      try {
        const orderId = parseInt(req.params.id as string, 10);
        console.log("Fetching order with ID:", orderId);

        if (!orderId || isNaN(orderId)) {
          console.log("Invalid order ID:", req.params.id);
          res.status(400).json({ message: "ID de pedido inválido" });
          return;
        }

        const order = await db.venta.findOne({
          where: { idventa: orderId },
        });

        if (!order) {
          console.log("Order not found for ID:", orderId);
          res.status(404).json({ message: "Pedido no encontrado" });
          return;
        }

        console.log("Order found:", order.idventa);

        // Obtener cliente
        let cliente = null;
        try {
          cliente = await db.cliente.findByPk(order.idcliente);
          console.log("Cliente loaded:", cliente?.nombre || "Sin cliente");
        } catch (clienteError) {
          console.error("Error loading cliente:", clienteError);
        }

        // Obtener detalles de venta
        let detalles: any[] = [];
        try {
          detalles = await db.detalle_venta.findAll({
            where: { idventa: orderId },
          });
          console.log("Detalles loaded:", detalles.length);
        } catch (detallesError) {
          console.error("Error loading detalles:", detallesError);
        }

        // Construir respuesta simple
        const normalizedStatus = normalizeOrderStatus(order.estado);
        const isPendiente = normalizedStatus === "PENDIENTE";
        const isEnviada = normalizedStatus === "ENVIADA";
        const isCerrada = normalizedStatus === "CERRADA";

        const response: any = {
          id: order.idventa,
          orderNumber: `ORD-${String(order.idventa).padStart(3, "0")}`,
          date: order.fecha_hora,
          status: normalizedStatus.toLowerCase(),
          customer: {
            name:
              String((order as any)?.cliente_nombre || "").trim() ||
              cliente?.nombre ||
              "Cliente",
            email: cliente?.email || "",
            phone:
              String((order as any)?.cliente_telefono || "").trim() ||
              cliente?.telefono ||
              "",
          },
          shippingAddress: {
            street:
              String((order as any)?.cliente_direccion || "").trim() ||
              cliente?.direccion ||
              "",
            city: "",
            postalCode: "",
            country: "España",
          },
          paymentMethod: "Pago online con tarjeta",
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
              completed: isPendiente || isEnviada || isCerrada,
            },
            {
              status: "Procesando",
              date: "",
              completed: isPendiente || isEnviada || isCerrada,
            },
            {
              status: "Enviado",
              date: "",
              completed: isEnviada || isCerrada,
            },
            {
              status: "Pedido entregado",
              date: "",
              completed: isCerrada,
            },
          ],
        };

        // Cargar artículos con error handling individual
        for (const detalle of detalles) {
          try {
            console.log(
              `Loading articulo for detalle ${detalle.idarticulo}`,
            );
            const articulo = await db.articulo.findByPk(detalle.idarticulo);

            if (!articulo) {
              console.warn(
                `Articulo not found with ID: ${detalle.idarticulo}`,
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
              `Error loading articulo ${detalle.idarticulo}:`,
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

        console.log("Response ready with", response.items.length, "items");
        res.json(response);
      } catch (error) {
        console.error("Error getting order:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Full error stack:", error);
        res
          .status(500)
          .json({ message: "Error obteniendo pedido", error: errorMessage });
      }
    },
  );

  /**
   * PUT /api/admin/orders/:id
   * Actualizar estado de pedido
   */
  router.put(
    "/orders/:id",
    ...requireStaff,
    async (req: Request, res: Response) => {
      try {
        const orderId = parseInt(req.params.id as string, 10);
        const order = await db.venta.findByPk(orderId);

        if (!order) {
          res
            .status(404)
            .json({ success: false, message: "Pedido no encontrado" });
          return;
        }

        const nextEstadoRaw = req.body?.estado;
        if (nextEstadoRaw !== undefined) {
          order.estado = normalizeOrderStatus(nextEstadoRaw);
        }

        if (req.body?.total !== undefined) {
          const nextTotal = Number(req.body.total);
          if (!Number.isFinite(nextTotal) || nextTotal <= 0) {
            res.status(400).json({ success: false, message: "Total inválido" });
            return;
          }
          order.total = nextTotal;
        }

        // Fecha y artículos no se editan desde administración de pedidos.

        const nextClienteNombre = String(req.body?.clienteNombre || "").trim();
        const nextClienteDireccion = String(
          req.body?.clienteDireccion || "",
        ).trim();
        const nextClienteTelefono = String(
          req.body?.clienteTelefono || "",
        ).trim();

        if (req.body?.clienteNombre !== undefined) {
          (order as any).cliente_nombre = nextClienteNombre || null;
        }
        if (req.body?.clienteDireccion !== undefined) {
          (order as any).cliente_direccion = nextClienteDireccion || null;
        }
        if (req.body?.clienteTelefono !== undefined) {
          (order as any).cliente_telefono = nextClienteTelefono || null;
        }

        if (nextClienteNombre || nextClienteDireccion || nextClienteTelefono) {
          const cliente = await db.cliente.findByPk(order.idcliente);
          if (cliente) {
            if (nextClienteNombre) {
              cliente.nombre = nextClienteNombre;
            }
            if (req.body?.clienteDireccion !== undefined) {
              cliente.direccion = nextClienteDireccion || undefined;
            }
            if (req.body?.clienteTelefono !== undefined) {
              cliente.telefono = nextClienteTelefono || undefined;
            }
            await cliente.save();
          }
        }

        await order.save();
        res.json({ success: true, order });
      } catch (error) {
        console.error("Error updating order:", error);
        res
          .status(500)
          .json({ success: false, message: "Error actualizando pedido" });
      }
    },
  );

  app.use("/api/admin", router);
  console.log("Rutas de admin registradas en /api/admin");
};
