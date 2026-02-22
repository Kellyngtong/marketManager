import { Response } from "express";
import { TenantRequest } from "@middlewares/tenant";
import { AuthRequest } from "@middlewares/authJwt";
import db from "@db/index";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * POST /api/pagos/crear-sesion
 * Crear sesión de Stripe Checkout
 */
export const crearSesionCheckout = async (
  req: TenantRequest & AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idusuario = req.idusuario;

    if (!idusuario) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    // Obtener items del carrito
    const items = await db.carrito_item.findAll({
      where: { idusuario },
      include: [
        {
          model: db.articulo,
          attributes: ["idarticulo", "nombre", "precio_venta", "imagen"],
        },
      ],
    });

    if (items.length === 0) {
      res.status(400).json({ message: "El carrito está vacío" });
      return;
    }

    // Crear line items para Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.Articulo.nombre,
          images: item.Articulo.imagen ? [item.Articulo.imagen] : [],
          metadata: {
            idarticulo: item.Articulo.idarticulo.toString(),
          },
        },
        unit_amount: Math.round(parseFloat(item.Articulo.precio_venta) * 100), // Convertir a centavos
      },
      quantity: item.cantidad,
    }));

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: req.email,
      success_url:
        process.env.STRIPE_SUCCESS_URL ||
        "http://localhost:8100/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        process.env.STRIPE_CANCEL_URL || "http://localhost:8100/payment-cancel",
      metadata: {
        idusuario: idusuario.toString(),
        id_tenant: req.tenant?.id_tenant?.toString() || "1",
      },
    });

    res.json({
      message: "Sesión de Stripe creada",
      sessionId: session.id,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      url: session.url,
    });
  } catch (error) {
    console.error("Error al crear sesión de Stripe:", error);
    res.status(500).json({
      message: "Error al crear sesión de pago",
      error:
        process.env.NODE_ENV === "development"
          ? (error as any).message
          : undefined,
    });
  }
};

/**
 * GET /api/pagos/sesion/:sessionId
 * Obtener información de la sesión de Stripe
 */
export const obtenerSesion = async (
  req: TenantRequest & AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ message: "ID de sesión requerido" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string,
    );

    res.json({
      message: "Sesión obtenida",
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null,
      },
    });
  } catch (error) {
    console.error("Error al obtener sesión:", error);
    res.status(500).json({
      message: "Error al obtener sesión",
      error:
        process.env.NODE_ENV === "development"
          ? (error as any).message
          : undefined,
    });
  }
};

/**
 * GET /api/pagos/confirmar-pago
 * Verificar y procesar pago exitoso (sin webhook)
 * Query: sessionId
 */
export const confirmarPago = async (
  req: TenantRequest & AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.query;
    const idusuario = req.idusuario;

    if (!sessionId || !idusuario) {
      res.status(400).json({ message: "sessionId e idusuario requeridos" });
      return;
    }

    // Obtener sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string,
    );

    if (!session) {
      res.status(404).json({ message: "Sesión no encontrada" });
      return;
    }

    // Verificar si el pago fue exitoso
    if (session.payment_status !== "paid") {
      res.status(400).json({
        message: "Pago no confirmado",
        status: session.payment_status,
      });
      return;
    }

    // Obtener items del carrito del usuario
    const items: any[] = await db.carrito_item.findAll({
      where: { idusuario },
      include: [{ model: db.articulo }],
    });

    if (!items.length) {
      res.status(400).json({ message: "Carrito vacío" });
      return;
    }

    // Obtener usuario
    const usuario = await db.usuario.findByPk(idusuario);
    if (!usuario) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    // Crear o actualizar cliente
    let cliente = await db.cliente.findOne({
      where: { email: usuario.email },
    });

    if (!cliente) {
      cliente = await db.cliente.create({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || null,
        direccion: usuario.direccion || null,
        tipo_documento: usuario.tipo_documento || null,
        num_documento: usuario.num_documento || null,
      });
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = Number(
        item.articulo?.precio_venta || item.Articulo?.precio_venta || 0,
      );
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * 0.18).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    // Crear venta
    const venta = await db.venta.create({
      idcliente: cliente.idcliente,
      idusuario,
      tipo_comprobante: "BOL",
      serie_comprobante: "MM01",
      num_comprobante: `MM${Date.now().toString().slice(-8)}`,
      fecha_hora: new Date(),
      impuesto,
      total,
      estado: "Completada",
      metodo_pago: "stripe",
      stripe_session_id: session.id,
    });

    // Crear detalles de venta y actualizar stock
    for (const item of items) {
      const precio = item.articulo?.precio_venta || item.Articulo?.precio_venta;

      await db.detalle_venta.create({
        idventa: venta.idventa,
        idarticulo: item.idarticulo,
        cantidad: item.cantidad,
        precio,
        descuento: 0,
      });

      // Actualizar stock
      const articulo = item.articulo || item.Articulo;
      if (articulo) {
        articulo.stock -= item.cantidad;
        await articulo.save();
      }
    }

    // Limpiar carrito
    await db.carrito_item.destroy({ where: { idusuario } });

    res.json({
      message: "Pago confirmado y venta creada",
      venta: {
        idventa: venta.idventa,
        num_comprobante: venta.num_comprobante,
        total: venta.total,
        estado: venta.estado,
      },
    });
  } catch (error) {
    console.error("Error confirmando pago:", error);
    res.status(500).json({
      message: "Error confirmando pago",
      error:
        process.env.NODE_ENV === "development"
          ? (error as any).message
          : undefined,
    });
  }
};

/**
 * POST /api/pagos/webhook
 * Webhook de Stripe para confirmar pagos
 */
export const handleWebhook = async (req: any, res: Response): Promise<void> => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const body = req.rawBody || req.body;

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Error en verificación de webhook:", err.message);
      res.status(400).json({ message: "Webhook signature inválida" });
      return;
    }

    // Manejar eventos de Stripe
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      res.json({ received: true });
    } else if (event.type === "payment_intent.succeeded") {
      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).json({
      message: "Error procesando webhook",
      error:
        process.env.NODE_ENV === "development"
          ? (error as any).message
          : undefined,
    });
  }
};
