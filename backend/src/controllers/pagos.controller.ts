import { Response } from "express";
import { TenantRequest } from "@middlewares/tenant";
import { AuthRequest } from "@middlewares/authJwt";
import db from "@db/index";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PREMIUM_ROLE_ID = 2;
const TAX_RATE = 0.18;
const PREMIUM_UPGRADE_PRICE = 15;
const STANDARD_CHECKOUT_TYPE = "cart_purchase";
const PREMIUM_CHECKOUT_TYPE = "premium_upgrade";

const toPositiveNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const roundPrice = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const isOfferValue = (oferta: any): boolean => {
  if (typeof oferta === "boolean") {
    return oferta;
  }
  if (typeof oferta === "number") {
    return oferta === 1;
  }

  const normalized = String(oferta || "")
    .trim()
    .toLowerCase();

  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "si" ||
    normalized === "sí"
  );
};

const isPremiumUser = (req: AuthRequest): boolean => {
  const idrol = req.idrol;
  const rolNombre = String(req.rolNombre || "").toLowerCase();
  return idrol === PREMIUM_ROLE_ID || rolNombre.includes("premium");
};

const sanitizeOriginalPricesMap = (
  value: any,
): Record<string, number> => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const sanitized: Record<string, number> = {};
  Object.entries(value).forEach(([key, mapValue]) => {
    const price = toPositiveNumber(mapValue);
    if (key && price > 0) {
      sanitized[String(key)] = price;
    }
  });

  return sanitized;
};

const serializeOriginalPrices = (
  map: Record<string, number>,
  articleIds: number[],
): string => {
  const allowedIds = new Set((articleIds || []).map((id) => String(id)));
  const entries = Object.entries(map)
    .filter(([key, price]) => allowedIds.has(key) && toPositiveNumber(price) > 0)
    .map(([key, price]) => `${key}|${roundPrice(Number(price))}`);

  const joined = entries.join(";");
  return joined.length <= 480 ? joined : "";
};

const parseSerializedOriginalPrices = (
  raw: any,
): Record<string, number> => {
  const text = String(raw || "").trim();
  if (!text) {
    return {};
  }

  const parsed: Record<string, number> = {};
  text.split(";").forEach((entry) => {
    const [id, value] = entry.split("|");
    const price = toPositiveNumber(value);
    if (id && price > 0) {
      parsed[id] = price;
    }
  });

  return parsed;
};

const getPremiumUnitPrice = (
  articulo: any,
  premium: boolean,
  originalPricesMap: Record<string, number>,
): number => {
  const currentPrice = toPositiveNumber(articulo?.precio_venta);
  if (!premium || currentPrice <= 0) {
    return currentPrice;
  }

  const oferta = isOfferValue(articulo?.oferta);
  if (!oferta) {
    return roundPrice(currentPrice * 0.95);
  }

  const articleId = String(articulo?.idarticulo || "").trim();
  const originalPrice = articleId
    ? toPositiveNumber(originalPricesMap[articleId])
    : 0;

  if (originalPrice > currentPrice) {
    const baseDiscount = Math.max(
      1,
      Math.round(((originalPrice - currentPrice) / originalPrice) * 100),
    );
    const totalDiscount = Math.min(baseDiscount + 10, 95);
    return roundPrice(originalPrice * (1 - totalDiscount / 100));
  }

  return roundPrice(currentPrice * 0.9);
};

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

    const usuarioSesion = await db.usuario.findByPk(idusuario, {
      attributes: ["idrol", "nombre", "direccion", "telefono", "email"],
    });
    const premium =
      Number(usuarioSesion?.idrol || 0) === PREMIUM_ROLE_ID || isPremiumUser(req);
    const requestOriginalPrices = sanitizeOriginalPricesMap(
      req.body?.pricingContext?.originalPrices,
    );

    // Obtener items del carrito
    const items = await db.carrito_item.findAll({
      where: { idusuario },
      include: [
        {
          model: db.articulo,
          attributes: [
            "idarticulo",
            "nombre",
            "precio_venta",
            "imagen",
            "descripcion",
            "oferta",
          ],
        },
      ],
    });

    if (items.length === 0) {
      res.status(400).json({ message: "El carrito está vacío" });
      return;
    }

    // Crear line items para Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const articulo = item.Articulo;
      const unitPrice = getPremiumUnitPrice(
        articulo,
        premium,
        requestOriginalPrices,
      );

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: articulo.nombre,
            images: articulo.imagen ? [articulo.imagen] : [],
            metadata: {
              idarticulo: articulo.idarticulo.toString(),
            },
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.cantidad,
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => {
      const unitPrice = getPremiumUnitPrice(
        item.Articulo,
        premium,
        requestOriginalPrices,
      );
      return sum + unitPrice * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * TAX_RATE).toFixed(2);

    if (impuesto > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Impuesto (IVA ${Math.round(TAX_RATE * 100)}%)`,
          },
          unit_amount: Math.round(impuesto * 100),
        },
        quantity: 1,
      });
    }

    const serializedOriginalPrices = serializeOriginalPrices(
      requestOriginalPrices,
      items.map((item: any) => item.Articulo?.idarticulo).filter(Boolean),
    );

    const direccionEnvio = String(
      req.body?.datosEnvio?.direccion || usuarioSesion?.direccion || "",
    )
      .trim()
      .slice(0, 180);
    const telefonoEnvio = String(
      req.body?.datosEnvio?.telefono || usuarioSesion?.telefono || "",
    )
      .trim()
      .slice(0, 40);
    const nombreCliente = String(usuarioSesion?.nombre || "")
      .trim()
      .slice(0, 100);

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
        checkout_type: STANDARD_CHECKOUT_TYPE,
        premium_pricing: premium ? "1" : "0",
        premium_original_prices: serializedOriginalPrices,
        direccion_envio: direccionEnvio,
        telefono_envio: telefonoEnvio,
        cliente_nombre: nombreCliente,
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
 * POST /api/pagos/crear-sesion-premium
 * Crear sesión de Stripe para upgrade a cliente premium (1 mes)
 */
export const crearSesionPremiumCheckout = async (
  req: TenantRequest & AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idusuario = req.idusuario;

    if (!idusuario) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "1 mes de cliente premium",
              description: "Upgrade a cuenta cliente premium durante 1 mes",
            },
            unit_amount: Math.round(PREMIUM_UPGRADE_PRICE * 100),
          },
          quantity: 1,
        },
      ],
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
        checkout_type: PREMIUM_CHECKOUT_TYPE,
      },
    });

    res.json({
      message: "Sesión de Stripe premium creada",
      sessionId: session.id,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      url: session.url,
    });
  } catch (error) {
    console.error("Error al crear sesión premium de Stripe:", error);
    res.status(500).json({
      message: "Error al crear sesión premium",
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

    const checkoutType = String(
      session.metadata?.checkout_type || STANDARD_CHECKOUT_TYPE,
    );

    const sessionUserId = Number(session.metadata?.idusuario || 0);
    if (sessionUserId > 0 && sessionUserId !== Number(idusuario)) {
      res.status(403).json({ message: "La sesión de pago no pertenece al usuario autenticado" });
      return;
    }

    if (checkoutType === PREMIUM_CHECKOUT_TYPE) {
      const usuarioPremium = await db.usuario.findByPk(idusuario);
      if (!usuarioPremium) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      if (Number(usuarioPremium.idrol || 0) !== PREMIUM_ROLE_ID) {
        usuarioPremium.idrol = PREMIUM_ROLE_ID;
        await usuarioPremium.save();
      }

      res.json({
        message: "Pago premium confirmado y rol actualizado",
        premiumUpdated: true,
        usuario: {
          idusuario: usuarioPremium.idusuario,
          idrol: usuarioPremium.idrol,
          rol: "premium",
        },
      });
      return;
    }

    const premiumBySession =
      String(session.metadata?.premium_pricing || "0") === "1";
    const originalPricesMap = parseSerializedOriginalPrices(
      session.metadata?.premium_original_prices,
    );

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

    const direccionEnvio = String(session.metadata?.direccion_envio || "")
      .trim()
      .slice(0, 180);
    const telefonoEnvio = String(session.metadata?.telefono_envio || "")
      .trim()
      .slice(0, 40);

    const resolvedNombre = String(usuario.nombre || "").trim();
    const resolvedDireccion =
      direccionEnvio || String(usuario.direccion || "").trim();
    const resolvedTelefono =
      telefonoEnvio || String(usuario.telefono || "").trim();

    // Persistir datos del checkout también en usuario
    let shouldUpdateUsuario = false;
    if (resolvedDireccion && usuario.direccion !== resolvedDireccion) {
      usuario.direccion = resolvedDireccion;
      shouldUpdateUsuario = true;
    }
    if (resolvedTelefono && usuario.telefono !== resolvedTelefono) {
      usuario.telefono = resolvedTelefono;
      shouldUpdateUsuario = true;
    }
    if (shouldUpdateUsuario) {
      await usuario.save();
    }

    // Crear o actualizar cliente
    let cliente = await db.cliente.findOne({
      where: { email: usuario.email },
    });

    if (!cliente) {
      cliente = await db.cliente.create({
        nombre: resolvedNombre || "Cliente",
        email: usuario.email,
        telefono: resolvedTelefono || null,
        direccion: resolvedDireccion || null,
        tipo_documento: usuario.tipo_documento || null,
        num_documento: usuario.num_documento || null,
      });
    } else {
      await cliente.update({
        nombre: resolvedNombre || cliente.nombre,
        telefono: resolvedTelefono || null,
        direccion: resolvedDireccion || null,
      });
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => {
      const articulo = item.articulo || item.Articulo;
      const price = getPremiumUnitPrice(
        articulo,
        premiumBySession,
        originalPricesMap,
      );
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * TAX_RATE).toFixed(2);
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
      estado: "NUEVO",
      cliente_nombre: resolvedNombre || cliente.nombre || "Cliente",
      cliente_telefono: resolvedTelefono || cliente.telefono || null,
      cliente_direccion: resolvedDireccion || cliente.direccion || null,
      metodo_pago: "stripe",
      stripe_session_id: session.id,
    });

    // Crear detalles de venta y actualizar stock
    for (const item of items) {
      const articuloVenta = item.articulo || item.Articulo;
      const precio = getPremiumUnitPrice(
        articuloVenta,
        premiumBySession,
        originalPricesMap,
      );

      await db.detalle_venta.create({
        idventa: venta.idventa,
        idarticulo: item.idarticulo,
        cantidad: item.cantidad,
        precio,
        descuento: 0,
      });

      // Actualizar stock
      if (articuloVenta) {
        articuloVenta.stock -= item.cantidad;
        await articuloVenta.save();
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
