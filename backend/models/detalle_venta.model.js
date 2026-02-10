module.exports = (sequelize, Sequelize) => {
  const DetalleVenta = sequelize.define("detalle_venta", {
    iddetalle_venta: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idventa: {
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
    precio: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
    descuento: {
      type: Sequelize.DECIMAL(11, 2),
      defaultValue: 0,
    },
  }, {
    timestamps: false,
    tableName: "detalle_venta",
  });

  return DetalleVenta;
};
