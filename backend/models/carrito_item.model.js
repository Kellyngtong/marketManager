module.exports = (sequelize, Sequelize) => {
  const CarritoItem = sequelize.define(
    "carrito_item",
    {
      idcarrito_item: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idusuario: {
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
        defaultValue: 1,
      },
    },
    {
      timestamps: true,
      tableName: "carrito_item",
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    }
  );

  return CarritoItem;
};
