module.exports = (sequelize, Sequelize) => {
  const Rol = sequelize.define("rol", {
    idrol: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: Sequelize.STRING(256),
      allowNull: true,
    },
    condicion: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  }, {
    timestamps: false,
    tableName: "rol",
  });

  return Rol;
};
