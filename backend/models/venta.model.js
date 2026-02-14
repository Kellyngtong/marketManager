module.exports = (sequelize, Sequelize) => {
  const Venta = sequelize.define("venta", {
    idventa: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idcliente: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    idusuario: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tipo_comprobante: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    serie_comprobante: {
      type: Sequelize.STRING(7),
      allowNull: true,
    },
    num_comprobante: {
      type: Sequelize.STRING(10),
      allowNull: false,
    },
    fecha_hora: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    impuesto: {
      type: Sequelize.DECIMAL(4, 2),
      defaultValue: 0,
    },
    total: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
    metodo_pago: {
      type: Sequelize.STRING(30),
      allowNull: true,
    },
    direccion_envio: {
      type: Sequelize.STRING(200),
      allowNull: true,
    },
    estado: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: "venta",
  });

  return Venta;
};
