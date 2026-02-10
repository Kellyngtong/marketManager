const db = require("../models");
const Categoria = db.categoria;

// =====================================================
// GET ALL - Obtener todas las categorías
// =====================================================
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { condicion: 1 },
      order: [["nombre", "ASC"]],
    });

    res.json({
      message: "Categorías obtenidas exitosamente",
      count: categorias.length,
      categorias,
    });
  } catch (err) {
    console.error("Error en getAllCategorias:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// GET BY ID - Obtener categoría por ID
// =====================================================
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findOne({
      where: { idcategoria: id, condicion: 1 },
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      message: "Categoría obtenida exitosamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en getCategoriaById:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// CREATE - Crear nueva categoría (solo ADMIN)
// =====================================================
exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    // Validar que no exista una categoría con ese nombre
    const existing = await Categoria.findOne({
      where: { nombre, condicion: 1 },
    });

    if (existing) {
      return res.status(400).json({
        message: `La categoría "${nombre}" ya existe`,
      });
    }

    // Crear categoría
    const categoria = await Categoria.create({
      nombre,
      descripcion: descripcion || null,
      condicion: 1,
    });

    res.status(201).json({
      message: "Categoría creada exitosamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en createCategoria:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// UPDATE - Actualizar categoría (solo ADMIN)
// =====================================================
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findOne({
      where: { idcategoria: id, condicion: 1 },
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Si se intenta cambiar el nombre, validar que no exista otro con ese nombre
    if (nombre && nombre !== categoria.nombre) {
      const existing = await Categoria.findOne({
        where: { nombre, condicion: 1 },
      });

      if (existing) {
        return res.status(400).json({
          message: `La categoría "${nombre}" ya existe`,
        });
      }
    }

    // Actualizar campos
    if (nombre) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;

    await categoria.save();

    res.json({
      message: "Categoría actualizada exitosamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en updateCategoria:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// DELETE - Eliminar categoría (soft delete - solo ADMIN)
// =====================================================
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findOne({
      where: { idcategoria: id, condicion: 1 },
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Verificar si la categoría tiene artículos asociados
    const articulosCount = await db.articulo.count({
      where: { idcategoria: id, condicion: 1 },
    });

    if (articulosCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar. Existen ${articulosCount} producto(s) en esta categoría`,
      });
    }

    // Soft delete: solo marcar como inactivo
    categoria.condicion = 0;
    await categoria.save();

    res.json({
      message: "Categoría eliminada exitosamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en deleteCategoria:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =====================================================
// GET WITH ARTICULOS - Obtener categoría con artículos
// =====================================================
exports.getCategoriaWithArticulos = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findOne({
      where: { idcategoria: id, condicion: 1 },
      include: [
        {
          model: db.articulo,
          attributes: [
            "idarticulo",
            "codigo",
            "nombre",
            "precio_venta",
            "stock",
          ],
          where: { condicion: 1 },
          required: false,
        },
      ],
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      message: "Categoría con artículos obtenida exitosamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en getCategoriaWithArticulos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
