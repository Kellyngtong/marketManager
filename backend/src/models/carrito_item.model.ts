import { DataTypes, Model, Sequelize } from 'sequelize';

export class CarritoItem extends Model {
  public idcarrito_item!: number;
  public idusuario!: number;
  public idarticulo!: number;
  public cantidad!: number;
  public creado_en?: Date;
  public actualizado_en?: Date;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  CarritoItem.init(
    {
      idcarrito_item: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idusuario: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      idarticulo: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: 'carrito_item',
      createdAt: 'creado_en',
      updatedAt: 'actualizado_en',
      modelName: 'CarritoItem',
    }
  );

  return CarritoItem;
};
