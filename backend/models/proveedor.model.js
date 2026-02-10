module.exports = (sequelize, Sequelize) => {
  const Proveedor = sequelize.define("proveedor", {
    idproveedor: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    tipo_documento: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    num_documento: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: Sequelize.STRING(70),
      allowNull: true,
    },
    telefono: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: "proveedor",
  });

  return Proveedor;
};
