import { DataTypes, Model, Sequelize } from 'sequelize';

export class DetalleIngreso extends Model {
  public iddetalle_ingreso!: number;
  public idingreso!: number;
  public idarticulo!: number;
  public cantidad!: number;
  public precio_compra!: number;
  public precio_venta!: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  DetalleIngreso.init(
    {
      iddetalle_ingreso: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idingreso: {
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
      },
      precio_compra: {
        type: dataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
      precio_venta: {
        type: dataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'detalle_ingreso',
      modelName: 'DetalleIngreso',
    }
  );

  return DetalleIngreso;
};
