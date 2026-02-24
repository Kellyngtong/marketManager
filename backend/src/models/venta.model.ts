import { DataTypes, Model, Sequelize } from "sequelize";

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
  public estado!: string;
  public cliente_nombre?: string;
  public cliente_telefono?: string;
  public cliente_direccion?: string;
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
      estado: {
        type: dataTypes.STRING(20),
        allowNull: false,
      },
      cliente_nombre: {
        type: dataTypes.STRING(100),
        allowNull: true,
      },
      cliente_telefono: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      cliente_direccion: {
        type: dataTypes.STRING(180),
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "venta",
      modelName: "Venta",
    },
  );

  return Venta;
};
