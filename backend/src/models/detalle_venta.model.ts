import { DataTypes, Model, Sequelize } from 'sequelize';

export class DetalleVenta extends Model {
  public iddetalle_venta!: number;
  public idventa!: number;
  public idarticulo!: number;
  public cantidad!: number;
  public precio!: number;
  public descuento!: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  DetalleVenta.init(
    {
      iddetalle_venta: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idventa: {
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
      precio: {
        type: dataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
      descuento: {
        type: dataTypes.DECIMAL(11, 2),
        defaultValue: 0,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'detalle_venta',
      modelName: 'DetalleVenta',
    }
  );

  return DetalleVenta;
};
