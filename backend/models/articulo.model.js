module.exports = (sequelize, Sequelize) => {
  const Articulo = sequelize.define("articulo", {
    idarticulo: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idcategoria: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    codigo: {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    precio_venta: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    descripcion: {
      type: Sequelize.STRING(256),
      allowNull: true,
    },
    imagen: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    condicion: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  }, {
    timestamps: false,
    tableName: "articulo",
  });

  return Articulo;
};
