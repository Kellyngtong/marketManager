const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// =====================================================
// MODELOS - SPRINT 1 (MVP)
// =====================================================

// Modelos base (sin dependencias)
db.rol = require("./rol.model.js")(sequelize, Sequelize);
db.categoria = require("./categoria.model.js")(sequelize, Sequelize);
db.cliente = require("./cliente.model.js")(sequelize, Sequelize);
db.proveedor = require("./proveedor.model.js")(sequelize, Sequelize);

// Modelo de usuario (depende de rol)
db.usuario = require("./usuario.model.js")(sequelize, Sequelize);

// Modelo de artículo (depende de categoría)
db.articulo = require("./articulo.model.js")(sequelize, Sequelize);

// Modelos de ingreso (compras a proveedores)
db.ingreso = require("./ingreso.model.js")(sequelize, Sequelize);
db.detalle_ingreso = require("./detalle_ingreso.model.js")(sequelize, Sequelize);

// Modelos de venta (ventas a clientes)
db.venta = require("./venta.model.js")(sequelize, Sequelize);
db.detalle_venta = require("./detalle_venta.model.js")(sequelize, Sequelize);
db.carrito_item = require("./carrito_item.model.js")(sequelize, Sequelize);

// =====================================================
// RELACIONES (FOREIGN KEYS)
// =====================================================

// Usuario -> Rol (muchos usuarios por rol)
db.usuario.belongsTo(db.rol, { 
  foreignKey: "idrol",
  targetKey: "idrol",
});
db.rol.hasMany(db.usuario, { 
  foreignKey: "idrol",
});

// Artículo -> Categoría (muchos artículos por categoría)
db.articulo.belongsTo(db.categoria, { 
  foreignKey: "idcategoria",
  targetKey: "idcategoria",
});
db.categoria.hasMany(db.articulo, { 
  foreignKey: "idcategoria",
});

// Ingreso -> Proveedor (muchos ingresos por proveedor)
db.ingreso.belongsTo(db.proveedor, { 
  foreignKey: "idproveedor",
  targetKey: "idproveedor",
});
db.proveedor.hasMany(db.ingreso, { 
  foreignKey: "idproveedor",
});

// Ingreso -> Usuario (muchos ingresos por usuario)
db.ingreso.belongsTo(db.usuario, { 
  foreignKey: "idusuario",
  targetKey: "idusuario",
});
db.usuario.hasMany(db.ingreso, { 
  foreignKey: "idusuario",
});

// DetalleIngreso -> Ingreso (muchos detalles por ingreso)
db.detalle_ingreso.belongsTo(db.ingreso, { 
  foreignKey: "idingreso",
  targetKey: "idingreso",
  onDelete: "CASCADE",
});
db.ingreso.hasMany(db.detalle_ingreso, { 
  foreignKey: "idingreso",
  onDelete: "CASCADE",
});

// DetalleIngreso -> Artículo
db.detalle_ingreso.belongsTo(db.articulo, { 
  foreignKey: "idarticulo",
  targetKey: "idarticulo",
});
db.articulo.hasMany(db.detalle_ingreso, { 
  foreignKey: "idarticulo",
});

// Venta -> Cliente (muchas ventas por cliente)
db.venta.belongsTo(db.cliente, { 
  foreignKey: "idcliente",
  targetKey: "idcliente",
});
db.cliente.hasMany(db.venta, { 
  foreignKey: "idcliente",
});

// Venta -> Usuario (muchas ventas por usuario)
db.venta.belongsTo(db.usuario, { 
  foreignKey: "idusuario",
  targetKey: "idusuario",
});
db.usuario.hasMany(db.venta, { 
  foreignKey: "idusuario",
});

// DetalleVenta -> Venta (muchos detalles por venta)
db.detalle_venta.belongsTo(db.venta, { 
  foreignKey: "idventa",
  targetKey: "idventa",
  onDelete: "CASCADE",
});
db.venta.hasMany(db.detalle_venta, { 
  foreignKey: "idventa",
  onDelete: "CASCADE",
});

// DetalleVenta -> Artículo
db.detalle_venta.belongsTo(db.articulo, { 
  foreignKey: "idarticulo",
  targetKey: "idarticulo",
});
db.articulo.hasMany(db.detalle_venta, { 
  foreignKey: "idarticulo",
});

// CarritoItem -> Usuario
db.carrito_item.belongsTo(db.usuario, {
  foreignKey: "idusuario",
  targetKey: "idusuario",
  onDelete: "CASCADE",
});
db.usuario.hasMany(db.carrito_item, {
  foreignKey: "idusuario",
  onDelete: "CASCADE",
});

// CarritoItem -> Artículo
db.carrito_item.belongsTo(db.articulo, {
  foreignKey: "idarticulo",
  targetKey: "idarticulo",
});
db.articulo.hasMany(db.carrito_item, {
  foreignKey: "idarticulo",
});

// =====================================================
// MODELOS LEGACY (Para compatibilidad fronted aún no migrado)
// =====================================================

db.products = require("./product.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);

module.exports = db;
