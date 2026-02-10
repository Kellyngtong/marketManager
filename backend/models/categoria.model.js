module.exports = (sequelize, Sequelize) => {
  const Categoria = sequelize.define("categoria", {
    idcategoria: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING(50),
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
    tableName: "categoria",
  });

  return Categoria;
};
