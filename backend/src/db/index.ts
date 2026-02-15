import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import dbConfig from '../config/database.config';

// Import models
import rolModel from '../models/rol.model';
import categoriaModel from '../models/categoria.model';
import clienteModel from '../models/cliente.model';
import proveedorModel from '../models/proveedor.model';
import usuarioModel from '../models/usuario.model';
import articuloModel from '../models/articulo.model';
import ingresoModel from '../models/ingreso.model';
import detalleIngresoModel from '../models/detalle_ingreso.model';
import ventaModel from '../models/venta.model';
import detalleVentaModel from '../models/detalle_venta.model';
import carritoItemModel from '../models/carrito_item.model';
import productModel from '../models/product.model';
import userModel from '../models/user.model';

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect as 'mysql' | 'postgres' | 'sqlite',
    pool: dbConfig.pool,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  }
);

// Define models
const db = {
  sequelize,
  Sequelize,
  // Models
  rol: rolModel(sequelize, DataTypes),
  categoria: categoriaModel(sequelize, DataTypes),
  cliente: clienteModel(sequelize, DataTypes),
  proveedor: proveedorModel(sequelize, DataTypes),
  usuario: usuarioModel(sequelize, DataTypes),
  articulo: articuloModel(sequelize, DataTypes),
  ingreso: ingresoModel(sequelize, DataTypes),
  detalle_ingreso: detalleIngresoModel(sequelize, DataTypes),
  venta: ventaModel(sequelize, DataTypes),
  detalle_venta: detalleVentaModel(sequelize, DataTypes),
  carrito_item: carritoItemModel(sequelize, DataTypes),
  products: productModel(sequelize, DataTypes),
  users: userModel(sequelize, DataTypes),
};

// Define associations
const defineAssociations = (): void => {
  const {
    rol,
    categoria,
    cliente,
    proveedor,
    usuario,
    articulo,
    ingreso,
    detalle_ingreso,
    venta,
    detalle_venta,
    carrito_item,
  } = db;

  // Usuario -> Rol
  usuario.belongsTo(rol, {
    foreignKey: 'idrol',
    targetKey: 'idrol',
  });
  rol.hasMany(usuario, { foreignKey: 'idrol' });

  // Artículo -> Categoría
  articulo.belongsTo(categoria, {
    foreignKey: 'idcategoria',
    targetKey: 'idcategoria',
  });
  categoria.hasMany(articulo, { foreignKey: 'idcategoria' });

  // Ingreso -> Proveedor
  ingreso.belongsTo(proveedor, {
    foreignKey: 'idproveedor',
    targetKey: 'idproveedor',
  });
  proveedor.hasMany(ingreso, { foreignKey: 'idproveedor' });

  // Ingreso -> Usuario
  ingreso.belongsTo(usuario, {
    foreignKey: 'idusuario',
    targetKey: 'idusuario',
  });
  usuario.hasMany(ingreso, { foreignKey: 'idusuario' });

  // DetalleIngreso -> Ingreso
  detalle_ingreso.belongsTo(ingreso, {
    foreignKey: 'idingreso',
    targetKey: 'idingreso',
    onDelete: 'CASCADE',
  });
  ingreso.hasMany(detalle_ingreso, {
    foreignKey: 'idingreso',
    onDelete: 'CASCADE',
  });

  // DetalleIngreso -> Artículo
  detalle_ingreso.belongsTo(articulo, {
    foreignKey: 'idarticulo',
    targetKey: 'idarticulo',
  });
  articulo.hasMany(detalle_ingreso, { foreignKey: 'idarticulo' });

  // Venta -> Cliente
  venta.belongsTo(cliente, {
    foreignKey: 'idcliente',
    targetKey: 'idcliente',
  });
  cliente.hasMany(venta, { foreignKey: 'idcliente' });

  // Venta -> Usuario
  venta.belongsTo(usuario, {
    foreignKey: 'idusuario',
    targetKey: 'idusuario',
  });
  usuario.hasMany(venta, { foreignKey: 'idusuario' });

  // DetalleVenta -> Venta
  detalle_venta.belongsTo(venta, {
    foreignKey: 'idventa',
    targetKey: 'idventa',
    onDelete: 'CASCADE',
  });
  venta.hasMany(detalle_venta, {
    foreignKey: 'idventa',
    onDelete: 'CASCADE',
  });

  // DetalleVenta -> Artículo
  detalle_venta.belongsTo(articulo, {
    foreignKey: 'idarticulo',
    targetKey: 'idarticulo',
  });
  articulo.hasMany(detalle_venta, { foreignKey: 'idarticulo' });

  // CarritoItem -> Usuario
  carrito_item.belongsTo(usuario, {
    foreignKey: 'idusuario',
    targetKey: 'idusuario',
    onDelete: 'CASCADE',
  });
  usuario.hasMany(carrito_item, { foreignKey: 'idusuario', onDelete: 'CASCADE' });

  // CarritoItem -> Artículo
  carrito_item.belongsTo(articulo, {
    foreignKey: 'idarticulo',
    targetKey: 'idarticulo',
  });
  articulo.hasMany(carrito_item, { foreignKey: 'idarticulo' });
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    defineAssociations();
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default db;
