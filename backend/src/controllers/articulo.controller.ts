import { Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Articulo } from '@models/articulo.model';
import { Categoria } from '@models/categoria.model';
import { TenantRequest } from '@middlewares/tenant';
import db from '@db/index';

// GET ALL - Obtener artículos con filtros (MULTITENANT)
export const getAllArticulos = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const {
      idcategoria,
      search,
      page = '1',
      limit = '10',
      orderBy = 'nombre',
      tipo,
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Filtro MULTITENANT - Si hay tenant, filtrar por tenant. Si no, mostrar todos los artículos públicos
    const whereCondition: any = {
      condicion: 1,
    };

    // Si el usuario está autenticado, filtrar por su tenant
    if (req.tenant?.id_tenant) {
      whereCondition.id_tenant = req.tenant.id_tenant;
      whereCondition.id_store = req.tenant.id_store || null;
    }
    // Si no hay autenticación, mostrar todos los artículos (públicos)

    if (idcategoria) {
      whereCondition.idcategoria = idcategoria;
    }

    if (tipo) {
      whereCondition.tipo = String(tipo).trim().toLowerCase();
    }

    if (search) {
      whereCondition[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } },
        { codigo: { [Op.like]: `%${search}%` } },
      ];
    }

    const orderByMap: any = {
      nombre: ['nombre', 'ASC'],
      precio_asc: ['precio_venta', 'ASC'],
      precio_desc: ['precio_venta', 'DESC'],
      stock: ['stock', 'DESC'],
      reciente: ['idarticulo', 'DESC'],
    };

    const order = orderByMap[orderBy as string] || ['nombre', 'ASC'];

    const { count, rows } = await (db.articulo as typeof Articulo).findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: db.categoria,
          attributes: ['idcategoria', 'nombre'],
          required: false,
        },
      ],
      order: [order],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      message: 'Artículos obtenidos exitosamente',
      count,
      page: pageNum,
      limit: limitNum,
      totalPages,
      articulos: rows,
    });
  } catch (err) {
    console.error('Error en getAllArticulos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET BY ID - Obtener artículo por ID (PÚBLICO - opcional token para filtro multitenant)
export const getArticuloById = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const whereClause: any = {
      idarticulo: id,
      condicion: 1,
    };

    // Si hay tenant, filtrar por tenant. Si no, mostrar artículo público
    if (req.tenant?.id_tenant) {
      whereClause.id_tenant = req.tenant.id_tenant;
      whereClause.id_store = req.tenant.id_store || null;
    }

    const articulo = await (db.articulo as typeof Articulo).findOne({
      where: whereClause,
      include: [
        {
          model: db.categoria,
          attributes: ['idcategoria', 'nombre'],
        },
      ],
    });

    if (!articulo) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }

    res.json({
      message: 'Artículo obtenido exitosamente',
      articulo,
    });
  } catch (err) {
    console.error('Error en getArticuloById:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET BY CODIGO
export const getArticuloByCodigo = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { codigo } = req.params;

    const articulo = await (db.articulo as typeof Articulo).findOne({
      where: { codigo, condicion: 1 },
      include: [
        {
          model: db.categoria,
          attributes: ['idcategoria', 'nombre'],
        },
      ],
    });

    if (!articulo) {
      res.status(404).json({
        message: `Artículo con código ${codigo} no encontrado`,
      });
      return;
    }

    res.json({
      message: 'Artículo obtenido exitosamente',
      articulo,
    });
  } catch (err) {
    console.error('Error en getArticuloByCodigo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// CREATE - Crear nuevo artículo
export const createArticulo = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const {
      codigo,
      nombre,
      precio_venta,
      stock,
      descripcion,
      idcategoria,
      imagen,
      tipo,
      oferta,
    } = req.body;

    if (!nombre || !precio_venta || idcategoria === undefined) {
      res.status(400).json({
        message: 'nombre, precio_venta e idcategoria son requeridos',
      });
      return;
    }

    const normalizedTipo = String(tipo || '').trim().toLowerCase();
    if (!normalizedTipo) {
      res.status(400).json({ message: 'tipo es requerido' });
      return;
    }

    const categoria = await (db.categoria as typeof Categoria).findByPk(idcategoria);
    if (!categoria) {
      res.status(400).json({ message: 'Categoría no encontrada' });
      return;
    }

    const existingNombre = await (db.articulo as typeof Articulo).findOne({
      where: { nombre, condicion: 1 },
    });
    if (existingNombre) {
      res.status(400).json({
        message: `Ya existe un artículo con el nombre "${nombre}"`,
      });
      return;
    }

    if (codigo) {
      const existingCodigo = await (db.articulo as typeof Articulo).findOne({
        where: { codigo, condicion: 1 },
      });
      if (existingCodigo) {
        res.status(400).json({
          message: `Ya existe un artículo con el código "${codigo}"`,
        });
        return;
      }
    }

    const articulo = await (db.articulo as typeof Articulo).create({
      idcategoria,
      codigo: codigo || null,
      nombre,
      precio_venta,
      tipo: normalizedTipo,
      stock: stock || 0,
      oferta: !!oferta,
      descripcion: descripcion || null,
      imagen: imagen || null,
      condicion: 1,
      id_tenant: req.tenant?.id_tenant || null,
      id_store: req.tenant?.id_store || null,
    });

    const articuloConCategoria = await (db.articulo as typeof Articulo).findByPk(
      articulo.idarticulo,
      {
        include: [{ model: db.categoria, attributes: ['idcategoria', 'nombre'] }],
      }
    );

    res.status(201).json({
      message: 'Artículo creado exitosamente',
      articulo: articuloConCategoria,
    });
  } catch (err) {
    console.error('Error en createArticulo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// UPDATE - Actualizar artículo
export const updateArticulo = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      precio_venta,
      stock,
      descripcion,
      idcategoria,
      imagen,
      tipo,
      oferta,
    } = req.body;

    const articulo = await (db.articulo as typeof Articulo).findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }

    if (nombre && nombre !== articulo.nombre) {
      const existing = await (db.articulo as typeof Articulo).findOne({
        where: { nombre, condicion: 1 },
      });
      if (existing) {
        res.status(400).json({
          message: `Ya existe un artículo con el nombre "${nombre}"`,
        });
        return;
      }
    }

    if (codigo && codigo !== articulo.codigo) {
      const existing = await (db.articulo as typeof Articulo).findOne({
        where: { codigo, condicion: 1 },
      });
      if (existing) {
        res.status(400).json({
          message: `Ya existe un artículo con el código "${codigo}"`,
        });
        return;
      }
    }

    if (idcategoria && idcategoria !== articulo.idcategoria) {
      const categoria = await (db.categoria as typeof Categoria).findByPk(idcategoria);
      if (!categoria) {
        res.status(400).json({ message: 'Categoría no encontrada' });
        return;
      }
    }

    if (codigo !== undefined) articulo.codigo = codigo;
    if (nombre) articulo.nombre = nombre;
    if (precio_venta) articulo.precio_venta = precio_venta;
    if (stock !== undefined) articulo.stock = stock;
    if (descripcion !== undefined) articulo.descripcion = descripcion;
    if (idcategoria) articulo.idcategoria = idcategoria;
    if (imagen !== undefined) articulo.imagen = imagen;
    if (oferta !== undefined) articulo.oferta = !!oferta;
    if (tipo !== undefined) {
      const normalizedTipo = String(tipo).trim().toLowerCase();
      if (!normalizedTipo) {
        res.status(400).json({ message: 'tipo no puede estar vacío' });
        return;
      }
      articulo.tipo = normalizedTipo;
    }

    await articulo.save();

    const articuloActualizado = await (db.articulo as typeof Articulo).findByPk(
      parseInt(id as string),
      {
        include: [{ model: db.categoria, attributes: ['idcategoria', 'nombre'] }],
      }
    );

    res.json({
      message: 'Artículo actualizado exitosamente',
      articulo: articuloActualizado,
    });
  } catch (err) {
    console.error('Error en updateArticulo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE - Soft delete
export const deleteArticulo = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const articulo = await (db.articulo as typeof Articulo).findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }

    const detalleVentaCount = await db.detalle_venta.count({
      where: { idarticulo: id },
    });

    const detalleIngresoCount = await db.detalle_ingreso.count({
      where: { idarticulo: id },
    });

    if (detalleVentaCount > 0 || detalleIngresoCount > 0) {
      res.status(400).json({
        message: 'No se puede eliminar. El artículo tiene historial de transacciones',
      });
      return;
    }

    articulo.condicion = false;
    await articulo.save();

    res.json({
      message: 'Artículo eliminado exitosamente',
      articulo,
    });
  } catch (err) {
    console.error('Error en deleteArticulo:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// UPDATE STOCK
export const updateStock = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (cantidad === undefined) {
      res.status(400).json({
        message: 'cantidad es requerida',
      });
      return;
    }

    const articulo = await (db.articulo as typeof Articulo).findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }

    articulo.stock = Math.max(0, articulo.stock + parseInt(cantidad));
    await articulo.save();

    res.json({
      message: 'Stock actualizado exitosamente',
      articulo: {
        idarticulo: articulo.idarticulo,
        nombre: articulo.nombre,
        stock: articulo.stock,
      },
    });
  } catch (err) {
    console.error('Error en updateStock:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
