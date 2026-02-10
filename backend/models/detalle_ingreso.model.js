module.exports = (sequelize, Sequelize) => {
  const DetalleIngreso = sequelize.define("detalle_ingreso", {
    iddetalle_ingreso: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idingreso: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    idarticulo: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    precio_compra: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
    precio_venta: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: "detalle_ingreso",
  });

  return DetalleIngreso;
};
