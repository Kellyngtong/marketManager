const db = require("../models");
const CarritoItem = db.carrito_item;
const Articulo = db.articulo;
const Sequelize = db.Sequelize;

const TAX_RATE = 0.18;

const getCartItems = async (idusuario) => {
  return CarritoItem.findAll({
    where: { idusuario },
    include: [
      {
        model: Articulo,
        attributes: [
          "idarticulo",
          "nombre",
          "precio_venta",
          "stock",
          "oferta",
          "imagen",
          "descripcion",
          "tipo",
        ],
      },
    ],
    order: [["idcarrito_item", "ASC"]],
  });
};

const buildTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const precioUnitario = item.articulo ? Number(item.articulo.precio_venta) : 0;
    return sum + precioUnitario * item.cantidad;
  }, 0);

  const impuesto = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + impuesto).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    impuesto,
    total,
    tasaImpuesto: TAX_RATE,
  };
};

exports.addToCart = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const { productoId, cantidad = 1 } = req.body;

    if (!productoId) {
      return res.status(400).json({ message: "productoId es requerido" });
    }

    const qty = parseInt(cantidad, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "cantidad debe ser un entero positivo" });
    }

    const articulo = await Articulo.findOne({
      where: { idarticulo: productoId, condicion: 1 },
    });

    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    if (articulo.stock < qty) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    const existing = await CarritoItem.findOne({
      where: { idusuario, idarticulo: productoId },
    });

    if (existing) {
      const nuevaCantidad = existing.cantidad + qty;
      if (nuevaCantidad > articulo.stock) {
        return res.status(400).json({ message: "Stock insuficiente para la cantidad solicitada" });
      }
      existing.cantidad = nuevaCantidad;
      await existing.save();
    } else {
      await CarritoItem.create({
        idusuario,
        idarticulo: productoId,
        cantidad: qty,
      });
    }

    const items = await getCartItems(idusuario);
    return res.status(201).json({
      message: "Producto agregado al carrito",
      items,
      totales: buildTotals(items),
    });
  } catch (err) {
    console.error("Error en addToCart:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.getCarrito = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const items = await getCartItems(idusuario);
    return res.json({
      items,
      totales: buildTotals(items),
    });
  } catch (err) {
    console.error("Error en getCarrito:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.updateCarrito = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const { itemId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad && cantidad !== 0) {
      return res.status(400).json({ message: "cantidad es requerida" });
    }

    const qty = parseInt(cantidad, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: "cantidad debe ser un entero mayor o igual a 0" });
    }

    const item = await CarritoItem.findOne({
      where: { idcarrito_item: itemId, idusuario },
      include: [{ model: Articulo }],
    });

    if (!item) {
      return res.status(404).json({ message: "Elemento no encontrado" });
    }

    if (qty === 0) {
      await item.destroy();
    } else {
      if (!item.articulo || item.articulo.stock < qty) {
        return res.status(400).json({ message: "Stock insuficiente" });
      }
      item.cantidad = qty;
      await item.save();
    }

    const items = await getCartItems(idusuario);
    return res.json({
      message: "Carrito actualizado",
      items,
      totales: buildTotals(items),
    });
  } catch (err) {
    console.error("Error en updateCarrito:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const { itemId } = req.params;

    const deleted = await CarritoItem.destroy({
      where: { idcarrito_item: itemId, idusuario },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Elemento no encontrado" });
    }

    const items = await getCartItems(idusuario);
    return res.json({
      message: "Producto eliminado del carrito",
      items,
      totales: buildTotals(items),
    });
  } catch (err) {
    console.error("Error en removeFromCart:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.clearCarrito = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    await CarritoItem.destroy({ where: { idusuario } });
    return res.json({
      message: "Carrito vaciado",
      items: [],
      totales: buildTotals([]),
    });
  } catch (err) {
    console.error("Error en clearCarrito:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.calcularTotal = async (req, res) => {
  try {
    const idusuario = req.idusuario;
    const items = await getCartItems(idusuario);
    return res.json(buildTotals(items));
  } catch (err) {
    console.error("Error en calcularTotal:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
