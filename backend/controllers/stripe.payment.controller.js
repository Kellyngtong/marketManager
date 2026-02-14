const db = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CarritoItem = db.carrito_item;
const Articulo = db.articulo;
const Venta = db.venta;
const DetalleVenta = db.detalle_venta;
const Usuario = db.usuario;
const Cliente = db.cliente;

const TAX_RATE = 0.18;

const buildNumeroComprobante = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `MM${timestamp}`;
};

const ensureCliente = async (usuario, datosEnvio, transaction) => {
  const email = usuario.email;
  let cliente = await Cliente.findOne({
    where: { email },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!cliente) {
    cliente = await Cliente.create(
      {
        nombre: usuario.nombre,
        email,
        telefono: datosEnvio?.telefono || usuario.telefono || null,
        direccion: datosEnvio?.direccion || usuario.direccion || null,
        tipo_documento: usuario.tipo_documento || null,
        num_documento: usuario.num_documento || null,
      },
      { transaction },
    );
  }

  return cliente;
};

/**
 * Crear sesión de Stripe Checkout
 * POST /api/pagos/crear-sesion
 * Body: { datosEnvio: { direccion, telefono } }
 */
exports.crearSesionPago = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const idusuario = req.idusuario;
    const { datosEnvio = {} } = req.body;

    // Obtener items del carrito
    const items = await CarritoItem.findAll({
      where: { idusuario },
      include: [{ model: Articulo }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!items.length) {
      await transaction.rollback();
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    // Validar disponibilidad
    for (const item of items) {
      if (!item.articulo || !item.articulo.condicion) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Uno de los artículos no está disponible" });
      }
      if (item.articulo.stock < item.cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para ${item.articulo.nombre}`,
        });
      }
    }

    // Calcular montos
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.articulo.precio_venta) || 0;
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    // Preparar line items para Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.articulo.nombre,
          description: item.articulo.descripcion,
          images: item.articulo.imagen ? [item.articulo.imagen] : [],
        },
        unit_amount: Math.round(Number(item.articulo.precio_venta) * 100), // en centavos
      },
      quantity: item.cantidad,
    }));

    // Agregar impuesto como line item separado
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Impuesto (IVA 18%)",
        },
        unit_amount: Math.round(impuesto * 100),
      },
      quantity: 1,
    });

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: req.user?.email || undefined,
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        idusuario,
        direccion_envio: datosEnvio?.direccion || "",
        telefono: datosEnvio?.telefono || "",
        impuesto: impuesto.toString(),
        subtotal: subtotal.toString(),
      },
    });

    // Guardar sesión en una tabla temporal (opcional - para auditoría)
    // Por ahora, solo guardamos en metadata

    await transaction.commit();

    return res.json({
      sessionId: session.id,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creando sesión Stripe:", err);
    return res.status(500).json({ message: "Error al crear sesión de pago" });
  }
};

/**
 * Webhook de Stripe para confirmar pago
 * POST /api/pagos/webhook
 */
exports.stripeWebhook = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      await transaction.rollback();
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar evento de pago exitoso
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await procesarPagoExitoso(session, transaction);
    }

    // Manejar evento de pago expirado/cancelado
    if (event.type === "checkout.session.expired") {
      console.log("Sesión de pago expirada:", event.data.object.id);
    }

    await transaction.commit();
    res.json({ received: true });
  } catch (err) {
    await transaction.rollback();
    console.error("Error procesando webhook:", err);
    return res.status(500).json({ message: "Error procesando webhook" });
  }
};

/**
 * Procesar pago exitoso desde webhook
 */
const procesarPagoExitoso = async (session, transaction) => {
  try {
    const metadata = session.metadata;
    const idusuario = parseInt(metadata.idusuario, 10);

    // Obtener carrito del usuario
    const items = await CarritoItem.findAll({
      where: { idusuario },
      include: [{ model: Articulo }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!items.length) {
      throw new Error("Carrito vacío para procesar");
    }

    // Obtener usuario
    const usuario = await Usuario.findByPk(idusuario, { transaction });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Asegurar cliente
    const datosEnvio = {
      direccion: metadata.direccion_envio,
      telefono: metadata.telefono,
    };
    const cliente = await ensureCliente(usuario, datosEnvio, transaction);

    // Calcular montos
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.articulo.precio_venta) || 0;
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +Number(metadata.impuesto);
    const total = +(subtotal + impuesto).toFixed(2);

    // Crear venta
    const venta = await Venta.create(
      {
        idcliente: cliente.idcliente,
        idusuario,
        tipo_comprobante: "BOL",
        serie_comprobante: "MM01",
        num_comprobante: buildNumeroComprobante(),
        fecha_hora: new Date(),
        impuesto,
        total,
        estado: "Completada",
        metodo_pago: "stripe",
        direccion_envio: datosEnvio.direccion || usuario.direccion || null,
        stripe_session_id: session.id,
      },
      { transaction },
    );

    // Crear detalles de venta y actualizar stock
    for (const item of items) {
      await DetalleVenta.create(
        {
          idventa: venta.idventa,
          idarticulo: item.idarticulo,
          cantidad: item.cantidad,
          precio: item.articulo.precio_venta,
          descuento: 0,
        },
        { transaction },
      );

      item.articulo.stock -= item.cantidad;
      await item.articulo.save({ transaction });
    }

    // Limpiar carrito
    await CarritoItem.destroy({ where: { idusuario }, transaction });

    console.log(`Venta creada exitosamente: ${venta.idventa}`);
    return venta;
  } catch (err) {
    console.error("Error procesando pago exitoso:", err);
    throw err;
  }
};

/**
 * Obtener estado de sesión de pago
 * GET /api/pagos/sesion/:sessionId
 */
exports.obtenerEstadoSesion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.json({
      id: session.id,
      status: session.payment_status, // paid, unpaid, no_payment_required
      customer_email: session.customer_email,
      metadata: session.metadata,
    });
  } catch (err) {
    console.error("Error obteniendo estado sesión:", err);
    return res
      .status(500)
      .json({ message: "Error obteniendo estado de sesión" });
  }
};

/**
 * Cancelar sesión (no es necesario - Stripe lo maneja, pero útil para UI)
 * POST /api/pagos/cancelar-sesion/:sessionId
 */
exports.cancelarSesion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Stripe no permite cancelar sesiones, pero podemos marcar como cancelada localmente
    // Para propósitos de auditoría, solo logueamos
    console.log(`Sesión cancelada por usuario: ${sessionId}`);

    return res.json({ message: "Sesión cancelada" });
  } catch (err) {
    console.error("Error cancelando sesión:", err);
    return res.status(500).json({ message: "Error cancelando sesión" });
  }
};
