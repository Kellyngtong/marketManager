import { Response } from 'express';
import { TenantRequest } from '@middlewares/tenant';
import db from '@db/index';
import { AuthRequest } from '@middlewares/authJwt';

const { CarritoItem, Articulo } = db.sequelize.models;

/**
 * Helper: Obtener carrito formateado
 */
const getFormattedCart = async (idusuario: number) => {
  const items = await CarritoItem.findAll({
    where: { idusuario },
    include: [
      {
        model: Articulo,
        attributes: ['idarticulo', 'nombre', 'descripcion', 'precio_venta', 'stock', 'imagen'],
      },
    ],
    order: [['creado_en', 'DESC']],
  });

  let subtotal = 0;
  const itemsFormateados = items.map((item: any) => {
    const precio = parseFloat(item.Articulo.precio_venta) || 0;
    const itemTotal = precio * item.cantidad;
    subtotal += itemTotal;

    return {
      idcarrito_item: item.idcarrito_item,
      idusuario: item.idusuario,
      idarticulo: item.idarticulo,
      cantidad: item.cantidad,
      creado_en: item.creado_en,
      actualizado_en: item.actualizado_en,
      articulo: {
        idarticulo: item.Articulo.idarticulo,
        nombre: item.Articulo.nombre,
        descripcion: item.Articulo.descripcion,
        precio_venta: parseFloat(item.Articulo.precio_venta),
        stock: item.Articulo.stock,
        imagen: item.Articulo.imagen,
      },
    };
  });

  // Calcular impuestos (21% IVA)
  const tasaImpuesto = 0.21;
  const impuesto = parseFloat((subtotal * tasaImpuesto).toFixed(2));
  const total = parseFloat((subtotal + impuesto).toFixed(2));

  return {
    items: itemsFormateados,
    totales: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuesto,
      total,
      tasaImpuesto,
    },
  };
};

/**
 * GET /api/carrito
 * Obtener todos los items del carrito del usuario autenticado
 */
export const getCarrito = async (req: TenantRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;

    if (!idusuario) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const cartData = await getFormattedCart(idusuario);
    res.json(cartData);
  } catch (error) {
    console.error('Error en getCarrito:', error);
    res.status(500).json({
      message: 'Error al obtener carrito',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * POST /api/carrito
 * Agregar item al carrito
 * Body: { idarticulo, cantidad }
 */
export const addToCarrito = async (req: TenantRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;
    // Aceptar tanto idarticulo como productoId
    const { idarticulo, productoId, cantidad } = req.body;
    const articleId = idarticulo || productoId;

    if (!idusuario) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!articleId || !cantidad) {
      res.status(400).json({ message: 'idarticulo (o productoId) y cantidad son requeridos' });
      return;
    }

    // Verificar que el artículo existe
    const articulo = await Articulo.findByPk(articleId);
    if (!articulo) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }

    // Verificar que hay stock
    if ((articulo as any).stock < cantidad) {
      res.status(400).json({
        message: 'Stock insuficiente',
        stock_disponible: (articulo as any).stock,
      });
      return;
    }

    // Verificar si ya existe en el carrito
    const existingItem = await CarritoItem.findOne({
      where: { idusuario, idarticulo: articleId },
    });

    if (existingItem) {
      // Actualizar cantidad
      (existingItem as any).cantidad += cantidad;
      await existingItem.save();
    } else {
      // Crear nuevo item
      await CarritoItem.create({
        idusuario,
        idarticulo: articleId,
        cantidad,
      });
    }

    // Retornar carrito actualizado
    const cartData = await getFormattedCart(idusuario);
    res.json(cartData);
  } catch (error) {
    console.error('Error en addToCarrito:', error);
    res.status(500).json({
      message: 'Error al agregar item al carrito',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * PUT /api/carrito/:idcarrito_item
 * Actualizar cantidad de un item en el carrito
 * Body: { cantidad }
 */
export const updateCarritoItem = async (req: TenantRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;
    const { idcarrito_item } = req.params;
    const { cantidad } = req.body;

    if (!idusuario) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!cantidad || cantidad < 1) {
      res.status(400).json({ message: 'cantidad debe ser mayor a 0' });
      return;
    }

    // Obtener el item del carrito
    const item = await CarritoItem.findOne({
      where: { idcarrito_item, idusuario },
      include: [
        {
          model: Articulo,
          attributes: ['stock'],
        },
      ],
    });

    if (!item) {
      res.status(404).json({ message: 'Item de carrito no encontrado' });
      return;
    }

    // Verificar stock
    const articulo = (item as any).Articulo;
    if (articulo.stock < cantidad) {
      res.status(400).json({
        message: 'Stock insuficiente',
        stock_disponible: articulo.stock,
      });
      return;
    }

    (item as any).cantidad = cantidad;
    await item.save();

    // Retornar carrito actualizado
    const cartData = await getFormattedCart(idusuario);
    res.json(cartData);
  } catch (error) {
    console.error('Error en updateCarritoItem:', error);
    res.status(500).json({
      message: 'Error al actualizar item del carrito',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * DELETE /api/carrito/:idcarrito_item
 * Eliminar item del carrito
 */
export const removeFromCarrito = async (req: TenantRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;
    const { idcarrito_item } = req.params;

    if (!idusuario) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const item = await CarritoItem.findOne({
      where: { idcarrito_item, idusuario },
    });

    if (!item) {
      res.status(404).json({ message: 'Item de carrito no encontrado' });
      return;
    }

    await item.destroy();

    // Retornar carrito actualizado
    const cartData = await getFormattedCart(idusuario);
    res.json(cartData);
  } catch (error) {
    console.error('Error en removeFromCarrito:', error);
    res.status(500).json({
      message: 'Error al eliminar item del carrito',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * DELETE /api/carrito
 * Vaciar carrito completo
 */
export const clearCarrito = async (req: TenantRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    const idusuario = req.idusuario;

    if (!idusuario) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    await CarritoItem.destroy({
      where: { idusuario },
    });

    // Retornar carrito vacío actualizado
    const cartData = await getFormattedCart(idusuario);
    res.json(cartData);
  } catch (error) {
    console.error('Error en clearCarrito:', error);
    res.status(500).json({
      message: 'Error al vaciar carrito',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
