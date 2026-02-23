import db from "@db/index";

const TAX_RATE = 0.18;

const buildNumeroComprobante = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  return `MM${timestamp}`;
};

const ensureCliente = async (usuario: any, datosEnvio: any, transaction: any) => {
  const email = usuario.email;
  let cliente = await (db.cliente as any).findOne({
    where: { email },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!cliente) {
    cliente = await (db.cliente as any).create(
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

const serializeVenta = (venta: any) => {
  const plain = venta.get({ plain: true });
  const detalles = plain.detalle_venta || plain.DetalleVenta || [];
  const items = (detalles || []).map((detalle: any) => ({
    iddetalle_venta: detalle.iddetalle_venta,
    cantidad: detalle.cantidad,
    precio: Number(detalle.precio),
    subtotal: Number(detalle.precio) * detalle.cantidad,
    articulo: detalle.articulo || detalle.Articulo,
  }));

  return {
    idventa: plain.idventa,
    numero: plain.num_comprobante,
    fecha: plain.fecha_hora,
    estado: plain.estado,
    impuesto: Number(plain.impuesto),
    total: Number(plain.total),
    items,
  };
};

export const checkout = async (req: any, res: any) => {
  const transaction = await db.sequelize.transaction();
  try {
    const idusuario = req.idusuario;
    const { datosEnvio = {} } = req.body || {};

    const items = await (db.carrito_item as any).findAll({
      where: { idusuario },
      include: [{ model: db.articulo }],
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

    const subtotal = items.reduce((sum: number, item: any) => {
      const price = Number(item.articulo.precio_venta) || 0;
      return sum + price * item.cantidad;
    }, 0);

    const impuesto = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    const usuario = await (db.usuario as any).findByPk(idusuario, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const cliente = await ensureCliente(usuario, datosEnvio, transaction);

    const venta = await (db.venta as any).create(
      {
        idcliente: cliente.idcliente,
        idusuario,
        tipo_comprobante: "BOL",
        serie_comprobante: "MM01",
        num_comprobante: buildNumeroComprobante(),
        fecha_hora: new Date(),
        impuesto,
        total,
        estado: "PENDIENTE",
        cliente_nombre: String(cliente.nombre || usuario.nombre || "Cliente").trim(),
        cliente_telefono: String(cliente.telefono || usuario.telefono || "").trim() || null,
        cliente_direccion: String(datosEnvio?.direccion || cliente.direccion || usuario.direccion || "").trim() || null,
      },
      { transaction },
    );

    for (const item of items) {
      await (db.detalle_venta as any).create(
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

    await (db.carrito_item as any).destroy({ where: { idusuario }, transaction });

    const ventaConDetalle = await (db.venta as any).findByPk(venta.idventa, {
      include: [
        {
          model: db.detalle_venta,
          include: [{ model: db.articulo }],
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

export const getHistorialCompras = async (req: any, res: any) => {
  try {
    const idusuario = req.idusuario;
    const ventas = await (db.venta as any).findAll({
      where: { idusuario },
      include: [
        {
          model: db.detalle_venta,
          include: [{ model: db.articulo }],
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

export const getDetalleVenta = async (req: any, res: any) => {
  try {
    const idusuario = req.idusuario;
    const { id } = req.params;

    const venta = await (db.venta as any).findOne({
      where: { idventa: id, idusuario },
      include: [
        {
          model: db.detalle_venta,
          include: [{ model: db.articulo }],
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
