import { DataTypes, Model, Sequelize } from 'sequelize';

export class Venta extends Model {
  public idventa!: number;
  public idcliente!: number;
  public idusuario!: number;
  public tipo_comprobante!: string;
  public serie_comprobante?: string;
  public num_comprobante!: string;
  public fecha_hora!: Date;
  public impuesto!: number;
  public total!: number;
  public metodo_pago?: string;
  public direccion_envio?: string;
  public estado!: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Venta.init(
    {
      idventa: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idcliente: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      idusuario: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      tipo_comprobante: {
        type: dataTypes.STRING(20),
        allowNull: false,
      },
      serie_comprobante: {
        type: dataTypes.STRING(7),
        allowNull: true,
      },
      num_comprobante: {
        type: dataTypes.STRING(10),
        allowNull: false,
      },
      fecha_hora: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      impuesto: {
        type: dataTypes.DECIMAL(4, 2),
        defaultValue: 0,
      },
      total: {
        type: dataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: dataTypes.STRING(30),
        allowNull: true,
      },
      direccion_envio: {
        type: dataTypes.STRING(200),
        allowNull: true,
      },
      estado: {
        type: dataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'venta',
      modelName: 'Venta',
    }
  );

  return Venta;
};
