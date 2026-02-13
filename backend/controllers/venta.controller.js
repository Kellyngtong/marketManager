const db = require("../models");
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
  let cliente = await Cliente.findOne({ where: { email }, transaction, lock: transaction.LOCK.UPDATE });

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
      { transaction }
    );
  }

  return cliente;
};

const serializeVenta = (venta) => {
  const plain = venta.get({ plain: true });
  const items = (plain.detalle_venta || []).map((detalle) => ({
    iddetalle_venta: detalle.iddetalle_venta,
    cantidad: detalle.cantidad,
    precio: Number(detalle.precio),
    subtotal: Number(detalle.precio) * detalle.cantidad,
    articulo: detalle.articulo,
  }));

  return {
    idventa: plain.idventa,
    numero: plain.num_comprobante,
    fecha: plain.fecha_hora,
    metodo_pago: plain.metodo_pago,
    direccion_envio: plain.direccion_envio,
    estado: plain.estado,
    impuesto: Number(plain.impuesto),
    total: Number(plain.total),
    items,
  };
};

exports.checkout = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const idusuario = req.idusuario;
    const { datosEnvio = {}, metodoPago, numeroTarjeta } = req.body;

    if (!metodoPago) {
      await transaction.rollback();
      return res.status(400).json({ message: "metodoPago es requerido" });
    }

    if (metodoPago === "tarjeta") {
      const card = String(numeroTarjeta || "").replace(/\s+/g, "");
      if (!/^\d{12,19}$/.test(card)) {
        await transaction.rollback();
        return res.status(400).json({ message: "Número de tarjeta inválido" });
      }
    }

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

    for (const item of items) {
      if (!item.articulo || !item.articulo.condicion) {
        await transaction.rollback();
        return res.status(400).json({ message: "Uno de los artículos no está disponible" });
      }
      if (item.articulo.stock < item.cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para ${item.articulo.nombre}`,
        });
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.articulo.precio_venta) || 0;
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    const usuario = await Usuario.findByPk(idusuario, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const cliente = await ensureCliente(usuario, datosEnvio, transaction);

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
        metodo_pago: metodoPago,
        direccion_envio: datosEnvio?.direccion || usuario.direccion || null,
      },
      { transaction }
    );

    for (const item of items) {
      await DetalleVenta.create(
        {
          idventa: venta.idventa,
          idarticulo: item.idarticulo,
          cantidad: item.cantidad,
          precio: item.articulo.precio_venta,
          descuento: 0,
        },
        { transaction }
      );

      item.articulo.stock -= item.cantidad;
      await item.articulo.save({ transaction });
    }

    await CarritoItem.destroy({ where: { idusuario }, transaction });

    const ventaConDetalle = await Venta.findByPk(venta.idventa, {
      include: [
        {
          model: DetalleVenta,
          include: [{ model: Articulo }],
        },
      ],
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      message: "Compra completada",
      venta: serializeVenta(ventaConDetalle),
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error en checkout:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.getHistorialCompras = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const ventas = await Venta.findAll({
      where: { idusuario },
      include: [
        {
          model: DetalleVenta,
          include: [{ model: Articulo }],
        },
      ],
      order: [["fecha_hora", "DESC"]],
    });

    return res.json({
      historial: ventas.map(serializeVenta),
    });
  } catch (err) {
    console.error("Error en getHistorialCompras:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.getDetalleVenta = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const { id } = req.params;

    const venta = await Venta.findOne({
      where: { idventa: id, idusuario },
      include: [
        {
          model: DetalleVenta,
          include: [{ model: Articulo }],
        },
      ],
    });

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.json({ venta: serializeVenta(venta) });
  } catch (err) {
    console.error("Error en getDetalleVenta:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
