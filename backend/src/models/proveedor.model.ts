import { DataTypes, Model, Sequelize } from 'sequelize';

export class Proveedor extends Model {
  public idproveedor!: number;
  public nombre!: string;
  public tipo_documento?: string;
  public num_documento?: string;
  public direccion?: string;
  public telefono?: string;
  public email?: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Proveedor.init(
    {
      idproveedor: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      tipo_documento: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      num_documento: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: dataTypes.STRING(70),
        allowNull: true,
      },
      telefono: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: dataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'proveedor',
      modelName: 'Proveedor',
    }
  );

  return Proveedor;
};
