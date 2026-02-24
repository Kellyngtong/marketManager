import { Sequelize, DataTypes, Model } from "sequelize";

export interface VentaAttributes {
  idventa?: number;
  idcliente: number;
  idusuario: number;
  tipo_comprobante: string;
  serie_comprobante?: string | null;
  num_comprobante: string;
  fecha_hora: Date;
  impuesto?: number;
  total: number;
  estado: string;
}

export class Venta extends Model<VentaAttributes> implements VentaAttributes {
  declare idventa: number;
  declare idcliente: number;
  declare idusuario: number;
  declare tipo_comprobante: string;
  declare serie_comprobante: string | null;
  declare num_comprobante: string;
  declare fecha_hora: Date;
  declare impuesto: number;
  declare total: number;
  declare estado: string;
}

export default (sequelize: Sequelize) => {
  Venta.init(
    {
      idventa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idcliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idusuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_comprobante: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      serie_comprobante: {
        type: DataTypes.STRING(7),
        allowNull: true,
      },
      num_comprobante: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      impuesto: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "venta",
      timestamps: false,
    },
  );

  return Venta;
};
