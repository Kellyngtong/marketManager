module.exports = (sequelize, Sequelize) => {
  const Ingreso = sequelize.define("ingreso", {
    idingreso: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idproveedor: {
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
    estado: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: "ingreso",
  });

  return Ingreso;
};
