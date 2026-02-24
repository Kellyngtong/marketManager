import { DataTypes, Model, Sequelize } from 'sequelize';

export class Ingreso extends Model {
  public idingreso!: number;
  public idproveedor!: number;
  public idusuario!: number;
  public tipo_comprobante!: string;
  public serie_comprobante?: string;
  public num_comprobante!: string;
  public fecha_hora!: Date;
  public impuesto!: number;
  public total!: number;
  public estado!: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Ingreso.init(
    {
      idingreso: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idproveedor: {
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
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'ingreso',
      modelName: 'Ingreso',
    }
  );

  return Ingreso;
};
