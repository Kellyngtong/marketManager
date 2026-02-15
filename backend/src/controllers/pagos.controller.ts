import { Response } from "express";
import { TenantRequest } from "@middlewares/tenant";
import { AuthRequest } from "@middlewares/authJwt";
import db from "@db/index";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const { CarritoItem, Articulo } = db.sequelize.models;

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
    const items = await CarritoItem.findAll({
      where: { idusuario },
      include: [
        {
          model: Articulo,
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
        currency: "usd",
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
      success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:8100/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:8100/payment-cancel",
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
      console.log("✅ Pago completado:", session.id);
      // Aquí se puede crear la orden en la BD

      res.json({ received: true });
    } else if (event.type === "payment_intent.succeeded") {
      console.log("✅ Payment intent succeeded");
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
