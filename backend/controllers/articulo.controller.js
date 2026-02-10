const db = require("../models");
const Articulo = db.articulo;
const Categoria = db.categoria;
const Op = db.Sequelize.Op;

// =====================================================
// GET ALL - Obtener todos los artículos con filtros
// =====================================================
exports.getAllArticulos = async (req, res) => {
  try {
    const { idcategoria, search, page = 1, limit = 10, orderBy = "nombre" } = req.query;
    const offset = (page - 1) * limit;

    // Construir condiciones de búsqueda
    let whereCondition = { condicion: 1 };

    if (idcategoria) {
      whereCondition.idcategoria = idcategoria;
    }

    if (search) {
      whereCondition[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } },
        { codigo: { [Op.like]: `%${search}%` } },
      ];
    }

    // Definir ordenamiento válido
    const orderByMap = {
      nombre: ["nombre", "ASC"],
      precio_asc: ["precio_venta", "ASC"],
      precio_desc: ["precio_venta", "DESC"],
      stock: ["stock", "DESC"],
      reciente: ["idarticulo", "DESC"],
    };

    const order = orderByMap[orderBy] || ["nombre", "ASC"];

    // Obtener datos paginados
    const { count, rows } = await Articulo.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Categoria,
          attributes: ["idcategoria", "nombre"],
          required: false,
        },
      ],
      order: [order],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      message: "Artículos obtenidos exitosamente",
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      articulos: rows,
    });
  } catch (err) {
    console.error("Error en getAllArticulos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// GET BY ID - Obtener artículo por ID
// =====================================================
exports.getArticuloById = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findOne({
      where: { idarticulo: id, condicion: 1 },
      include: [
        {
          model: Categoria,
          attributes: ["idcategoria", "nombre"],
        },
      ],
    });

    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    res.json({
      message: "Artículo obtenido exitosamente",
      articulo,
    });
  } catch (err) {
    console.error("Error en getArticuloById:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// GET BY CODIGO - Obtener artículo por código
// =====================================================
exports.getArticuloByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const articulo = await Articulo.findOne({
      where: { codigo, condicion: 1 },
      include: [
        {
          model: Categoria,
          attributes: ["idcategoria", "nombre"],
        },
      ],
    });

    if (!articulo) {
      return res.status(404).json({ 
        message: `Artículo con código ${codigo} no encontrado` 
      });
    }

    res.json({
      message: "Artículo obtenido exitosamente",
      articulo,
    });
  } catch (err) {
    console.error("Error en getArticuloByCodigo:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// CREATE - Crear nuevo artículo (solo EMPLEADO+)
// =====================================================
exports.createArticulo = async (req, res) => {
  try {
    const { codigo, nombre, precio_venta, stock, descripcion, idcategoria, imagen } = req.body;

    // Validar campos requeridos
    if (!nombre || !precio_venta || idcategoria === undefined) {
      return res.status(400).json({
        message: "nombre, precio_venta e idcategoria son requeridos",
      });
    }

    // Validar que la categoría exista
    const categoria = await Categoria.findByPk(idcategoria);
    if (!categoria) {
      return res.status(400).json({ message: "Categoría no encontrada" });
    }

    // Validar que no exista artículo con ese nombre
    const existingNombre = await Articulo.findOne({
      where: { nombre, condicion: 1 },
    });
    if (existingNombre) {
      return res.status(400).json({
        message: `Ya existe un artículo con el nombre "${nombre}"`,
      });
    }

    // Validar que no exista artículo con ese código (si se proporciona)
    if (codigo) {
      const existingCodigo = await Articulo.findOne({
        where: { codigo, condicion: 1 },
      });
      if (existingCodigo) {
        return res.status(400).json({
          message: `Ya existe un artículo con el código "${codigo}"`,
        });
      }
    }

    // Crear artículo
    const articulo = await Articulo.create({
      idcategoria,
      codigo: codigo || null,
      nombre,
      precio_venta,
      stock: stock || 0,
      descripcion: descripcion || null,
      imagen: imagen || null,
      condicion: 1,
    });

    // Obtener con relación
    const articuloConCategoria = await Articulo.findByPk(articulo.idarticulo, {
      include: [{ model: Categoria, attributes: ["idcategoria", "nombre"] }],
    });

    res.status(201).json({
      message: "Artículo creado exitosamente",
      articulo: articuloConCategoria,
    });
  } catch (err) {
    console.error("Error en createArticulo:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// UPDATE - Actualizar artículo (solo EMPLEADO+)
// =====================================================
exports.updateArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, precio_venta, stock, descripcion, idcategoria, imagen } = req.body;

    const articulo = await Articulo.findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Validar cambios de nombre y código
    if (nombre && nombre !== articulo.nombre) {
      const existing = await Articulo.findOne({
        where: { nombre, condicion: 1 },
      });
      if (existing) {
        return res.status(400).json({
          message: `Ya existe un artículo con el nombre "${nombre}"`,
        });
      }
    }

    if (codigo && codigo !== articulo.codigo) {
      const existing = await Articulo.findOne({
        where: { codigo, condicion: 1 },
      });
      if (existing) {
        return res.status(400).json({
          message: `Ya existe un artículo con el código "${codigo}"`,
        });
      }
    }

    // Validar categoría si se intenta cambiar
    if (idcategoria && idcategoria !== articulo.idcategoria) {
      const categoria = await Categoria.findByPk(idcategoria);
      if (!categoria) {
        return res.status(400).json({ message: "Categoría no encontrada" });
      }
    }

    // Actualizar campos
    if (codigo !== undefined) articulo.codigo = codigo;
    if (nombre) articulo.nombre = nombre;
    if (precio_venta) articulo.precio_venta = precio_venta;
    if (stock !== undefined) articulo.stock = stock;
    if (descripcion !== undefined) articulo.descripcion = descripcion;
    if (idcategoria) articulo.idcategoria = idcategoria;
    if (imagen !== undefined) articulo.imagen = imagen;

    await articulo.save();

    // Obtener con relación
    const articuloActualizado = await Articulo.findByPk(id, {
      include: [{ model: Categoria, attributes: ["idcategoria", "nombre"] }],
    });

    res.json({
      message: "Artículo actualizado exitosamente",
      articulo: articuloActualizado,
    });
  } catch (err) {
    console.error("Error en updateArticulo:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// DELETE - Eliminar artículo (soft delete - solo EMPLEADO+)
// =====================================================
exports.deleteArticulo = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Verificar si hay detalles de venta o ingreso sin procesar
    const detalleVentaCount = await db.detalle_venta.count({
      where: { idarticulo: id },
    });

    const detalleIngresoCount = await db.detalle_ingreso.count({
      where: { idarticulo: id },
    });

    if (detalleVentaCount > 0 || detalleIngresoCount > 0) {
      return res.status(400).json({
        message: "No se puede eliminar. El artículo tiene historial de transacciones",
      });
    }

    // Soft delete
    articulo.condicion = 0;
    await articulo.save();

    res.json({
      message: "Artículo eliminado exitosamente",
      articulo,
    });
  } catch (err) {
    console.error("Error en deleteArticulo:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// UPDATE STOCK - Actualizar stock de un artículo
// =====================================================
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (cantidad === undefined) {
      return res.status(400).json({
        message: "cantidad es requerida",
      });
    }

    const articulo = await Articulo.findOne({
      where: { idarticulo: id, condicion: 1 },
    });

    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Actualizar stock (puede ser positivo o negativo)
    articulo.stock = Math.max(0, articulo.stock + parseInt(cantidad));
    await articulo.save();

    res.json({
      message: "Stock actualizado exitosamente",
      articulo: {
        idarticulo: articulo.idarticulo,
        nombre: articulo.nombre,
        stock: articulo.stock,
      },
    });
  } catch (err) {
    console.error("Error en updateStock:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
